"use client";

import { useEffect } from "react";

export default function RedirectAddresses() {
  useEffect(() => {
    window.location.href = "/account/settings";
  }, []);

  return null;
}
