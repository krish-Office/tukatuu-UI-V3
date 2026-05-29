import { Product } from "./types";

/**
 * Standard structures representing an Elasticsearch Query DSL Request.
 */
export interface ElasticSearchRequest {
  query?: {
    bool?: {
      must?: Array<{
        multi_match?: {
          query: string;
          fields: string[];
          fuzziness?: string | number;
        };
        match?: {
          [key: string]: any;
        };
      }>;
      filter?: Array<{
        term?: {
          [key: string]: any;
        };
        range?: {
          [key: string]: {
            gte?: number;
            lte?: number;
          };
        };
      }>;
    };
    multi_match?: {
      query: string;
      fields: string[];
      fuzziness?: string | number;
    };
  };
  size?: number;
  from?: number;
  sort?: Array<{
    [key: string]: {
      order: "asc" | "desc";
    };
  } | string>;
  highlight?: {
    pre_tags?: string[];
    post_tags?: string[];
    fields: {
      [key: string]: any;
    };
  };
  aggs?: {
    [key: string]: {
      terms: {
        field: string;
        size?: number;
      };
    };
  };
}

/**
 * Standard structures representing an Elasticsearch Response.
 */
export interface ElasticSearchHit {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Product;
  highlight?: {
    [key: string]: string[];
  };
}

export interface ElasticSearchResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: "eq" | "gte";
    };
    max_score: number;
    hits: ElasticSearchHit[];
  };
  aggregations?: {
    [key: string]: {
      doc_count_error_upper_bound: number;
      sum_other_doc_count: number;
      buckets: Array<{
        key: string;
        doc_count: number;
      }>;
    };
  };
}

/**
 * Helper to compute Levenshtein distance between two strings for fuzzy matching.
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j, alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[alen][blen];
}

/**
 * Helper to check if a word matches another word, either exactly or fuzzily.
 * Returns a score coefficient: 1.0 for exact matches, lower for fuzzy, 0.0 for no match.
 */
function getWordMatchScore(queryWord: string, docWord: string, allowFuzzy: boolean): number {
  const qw = queryWord.toLowerCase();
  const dw = docWord.toLowerCase();

  // Exact match
  if (qw === dw) return 1.0;
  
  // Prefix match (good for autocomplete/substring)
  if (dw.startsWith(qw)) return 0.8;
  if (dw.includes(qw)) return 0.5;

  if (allowFuzzy) {
    const distance = getLevenshteinDistance(qw, dw);
    // Allow max distance of 2 for words >= 5 chars, distance 1 for words >= 3 chars
    if (qw.length >= 5 && distance <= 2) {
      return 1.0 - (distance * 0.35); // distance 1 = 0.65, distance 2 = 0.3
    }
    if (qw.length >= 3 && distance <= 1) {
      return 0.5;
    }
  }

  return 0.0;
}

/**
 * Simulated Elasticsearch Engine.
 * Executes full Elasticsearch Query DSL queries in-memory against the given products.
 */
export function executeElasticSearch(
  products: Product[],
  request: ElasticSearchRequest
): ElasticSearchResponse {
  const startTime = performance.now();

  let filteredProducts = [...products];
  const queryDSL = request.query;

  // Extract search terms and fields
  let searchTerms: string[] = [];
  let matchFields: Array<{ name: string; boost: number }> = [];
  let isFuzzy = false;

  // 1. Process Filters (Category, Brand, etc.)
  if (queryDSL?.bool?.filter) {
    for (const filterItem of queryDSL.bool.filter) {
      if (filterItem.term) {
        const [field, value] = Object.entries(filterItem.term)[0];
        if (value !== undefined && value !== null && value !== "") {
          filteredProducts = filteredProducts.filter((p) => {
            const pValue = (p as any)[field];
            if (Array.isArray(pValue)) {
              return pValue.some((v) => String(v).toLowerCase() === String(value).toLowerCase());
            }
            return String(pValue).toLowerCase() === String(value).toLowerCase();
          });
        }
      }
      if (filterItem.range) {
        const [field, rangeOpts] = Object.entries(filterItem.range)[0];
        const { gte, lte } = rangeOpts as { gte?: number; lte?: number };
        filteredProducts = filteredProducts.filter((p) => {
          const val = Number((p as any)[field]);
          if (gte !== undefined && val < gte) return false;
          if (lte !== undefined && val > lte) return false;
          return true;
        });
      }
    }
  }

  // 2. Extract multi_match query parameters
  let queryText = "";
  let rawFields: string[] = [];

  if (queryDSL?.multi_match) {
    queryText = queryDSL.multi_match.query;
    rawFields = queryDSL.multi_match.fields || ["name", "description"];
    isFuzzy = queryDSL.multi_match.fuzziness === "AUTO" || !!queryDSL.multi_match.fuzziness;
  } else if (queryDSL?.bool?.must) {
    const mmQuery = queryDSL.bool.must.find((m) => m.multi_match);
    if (mmQuery?.multi_match) {
      queryText = mmQuery.multi_match.query;
      rawFields = mmQuery.multi_match.fields || ["name", "description"];
      isFuzzy = mmQuery.multi_match.fuzziness === "AUTO" || !!mmQuery.multi_match.fuzziness;
    }
  }

  if (queryText.trim()) {
    searchTerms = queryText.trim().split(/\s+/).filter(Boolean);
    
    // Parse boosted fields like "name^3", "tags^2"
    matchFields = rawFields.map((fieldStr) => {
      const parts = fieldStr.split("^");
      const name = parts[0];
      const boost = parts[1] ? parseFloat(parts[1]) : 1.0;
      return { name, boost };
    });
  }

  // Calculate matching scores (resemblance of BM25)
  const scoredHits: Array<{ product: Product; score: number; highlight: Record<string, string[]> }> = [];

  for (const product of filteredProducts) {
    let score = 0;
    const highlight: Record<string, string[]> = {};

    if (searchTerms.length > 0) {
      let matchedAnyTerm = false;

      // Calculate score across all query terms
      for (const term of searchTerms) {
        let maxTermScoreForDoc = 0;
        let matchedField = "";
        let matchedSnippet = "";

        for (const { name: fieldName, boost } of matchFields) {
          const fieldValue = (product as any)[fieldName];
          if (!fieldValue) continue;

          // Handle array of strings (like tags)
          if (Array.isArray(fieldValue)) {
            for (const item of fieldValue) {
              const strVal = String(item);
              const words = strVal.split(/\s+/);
              for (const word of words) {
                const matchVal = getWordMatchScore(term, word, isFuzzy);
                if (matchVal > 0) {
                  const itemScore = matchVal * boost * 2.0; // Boost array/tag matches slightly
                  if (itemScore > maxTermScoreForDoc) {
                    maxTermScoreForDoc = itemScore;
                    matchedField = fieldName;
                    matchedSnippet = strVal;
                  }
                }
              }
            }
            continue;
          }

          // Handle text fields (name, description, brand, etc.)
          const text = String(fieldValue);
          const words = text.split(/\s+/);

          for (const word of words) {
            // Clean word from punctuation
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            const matchVal = getWordMatchScore(term, cleanWord, isFuzzy);
            if (matchVal > 0) {
              // BM25 approximation: term frequency and field length normalisation
              // For simplicity: score = match coefficient * field boost * word frequency bonus
              const wordScore = matchVal * boost;
              if (wordScore > maxTermScoreForDoc) {
                maxTermScoreForDoc = wordScore;
                matchedField = fieldName;
                matchedSnippet = text;
              }
            }
          }
        }

        if (maxTermScoreForDoc > 0) {
          score += maxTermScoreForDoc;
          matchedAnyTerm = true;

          // Generate Highlights
          if (request.highlight && matchedField) {
            const preTag = request.highlight.pre_tags?.[0] || "<em>";
            const postTag = request.highlight.post_tags?.[0] || "</em>";
            const originalVal = String((product as any)[matchedField]);

            // Replace occurrences with highlighted tags
            const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            let regex = new RegExp(`(${escapedTerm})`, "gi");

            // If fuzzy matching matched, do a more robust case-insensitive word replacement
            if (originalVal.toLowerCase().includes(term.toLowerCase())) {
              highlight[matchedField] = [
                originalVal.replace(regex, `${preTag}$1${postTag}`),
              ];
            } else if (isFuzzy) {
              // Highlight fuzzy matches by finding words in the text with Levenshtein <= 2
              const wordsInOriginal = originalVal.split(/(\s+)/);
              const highlightedWords = wordsInOriginal.map((w) => {
                const cleanW = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
                if (cleanW && getWordMatchScore(term, cleanW, true) > 0.4) {
                  return `${preTag}${w}${postTag}`;
                }
                return w;
              });
              highlight[matchedField] = [highlightedWords.join("")];
            }
          }
        }
      }

      if (!matchedAnyTerm) {
        continue; // No match found for any term of the search query
      }
    } else {
      // If no query terms, every item gets a baseline score (match_all simulation)
      score = 1.0;
    }

    scoredHits.push({
      product,
      score,
      highlight,
    });
  }

  // 3. Sorting
  if (request.sort && request.sort.length > 0) {
    const sortFieldObj = request.sort[0];
    if (typeof sortFieldObj === "object") {
      const [field, sortOpts] = Object.entries(sortFieldObj)[0];
      const isAsc = (sortOpts as any).order === "asc";
      scoredHits.sort((a, b) => {
        const valA = (a.product as any)[field];
        const valB = (b.product as any)[field];
        if (typeof valA === "number" && typeof valB === "number") {
          return isAsc ? valA - valB : valB - valA;
        }
        return isAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    } else if (sortFieldObj === "_score") {
      scoredHits.sort((a, b) => b.score - a.score);
    }
  } else {
    // Default sorting is by score descending
    scoredHits.sort((a, b) => b.score - a.score);
  }

  // 4. Pagination
  const from = request.from || 0;
  const size = request.size || 10;
  const paginatedHits = scoredHits.slice(from, from + size);

  // 5. Build Elasticsearch response hits structure
  const maxScore = scoredHits.length > 0 ? scoredHits[0].score : 0.0;
  const hits: ElasticSearchHit[] = paginatedHits.map((h) => ({
    _index: "products",
    _type: "_doc",
    _id: h.product.id,
    _score: parseFloat(h.score.toFixed(4)),
    _source: h.product,
    highlight: Object.keys(h.highlight).length > 0 ? h.highlight : undefined,
  }));

  // 6. Process Aggregations (Facets)
  const aggregations: Record<string, any> = {};
  if (request.aggs) {
    for (const [aggName, aggBody] of Object.entries(request.aggs)) {
      const field = aggBody.terms.field;
      const counts: Record<string, number> = {};

      // Calculate term counts from the *filtered products* before text matching is run (to show facet counts correctly)
      // or from the matching set to show matched totals. Standard Elasticsearch does it on the matched set.
      const targetDocsForAggs = searchTerms.length > 0 ? scoredHits : filteredProducts.map(p => ({ product: p }));
      
      for (const item of targetDocsForAggs) {
        const val = (item.product as any)[field];
        if (val) {
          if (Array.isArray(val)) {
            for (const element of val) {
              const strEl = String(element);
              counts[strEl] = (counts[strEl] || 0) + 1;
            }
          } else {
            const strVal = String(val);
            counts[strVal] = (counts[strVal] || 0) + 1;
          }
        }
      }

      const buckets = Object.entries(counts)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .sort((a, b) => b.doc_count - a.doc_count);

      aggregations[aggName] = {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets,
      };
    }
  }

  const endTime = performance.now();
  const took = Math.round(endTime - startTime);

  return {
    took,
    timed_out: false,
    _shards: {
      total: 1,
      successful: 1,
      skipped: 0,
      failed: 0,
    },
    hits: {
      total: {
        value: scoredHits.length,
        relation: "eq",
      },
      max_score: parseFloat(maxScore.toFixed(4)),
      hits,
    },
    aggregations: Object.keys(aggregations).length > 0 ? aggregations : undefined,
  };
}
