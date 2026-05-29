"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, X, ArrowLeft } from "lucide-react";
import { User, Address } from "@/lib/types";
import { useDBValue } from "@/lib/db";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getCurrentUser } from "@/lib/auth";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false, loading: () => <div className="w-full h-[300px] bg-mint-50/50 border border-mint-150 animate-pulse rounded-2xl flex items-center justify-center text-mint-700 font-bold text-sm">Loading Interactive Map...</div> });
const StaticMap = dynamic(() => import("@/components/StaticMap"), { ssr: false, loading: () => <div className="w-full h-full bg-mint-50/30 animate-pulse"></div> });
const DEFAULT_LOCATION = { lat: 27.7172, lng: 85.3240 };

export default function AddressSettingsPage() {
  const user = useDBValue<User | null>("greenmart_current_user");
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [name, setName] = useState("Home");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [stateProvince, setStateProvince] = useState("Bagmati");
  const [zipCode, setZipCode] = useState("44600");
  const [selectedLat, setSelectedLat] = useState<number>(DEFAULT_LOCATION.lat);
  const [selectedLng, setSelectedLng] = useState<number>(DEFAULT_LOCATION.lng);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const activeUser = getCurrentUser();
      if (activeUser === null) {
        window.location.href = "/login";
      }
    }
  }, [mounted]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleAddressExtracted = (info: { city: string; street: string }) => {
    if (info.city) setCity(info.city);
    if (info.street) setStreet(info.street);
  };

  const resetForm = () => {
    setName("Home");
    setStreet("");
    setCity("Kathmandu");
    setStateProvince("Bagmati");
    setZipCode("44600");
    setSelectedLat(DEFAULT_LOCATION.lat);
    setSelectedLng(DEFAULT_LOCATION.lng);
    setEditingAddressId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleEdit = (address: Address) => {
    setName(address.name);
    setStreet(address.street);
    setCity(address.city);
    setStateProvince(address.state);
    setZipCode(address.zip);
    setSelectedLat(address.lat ?? DEFAULT_LOCATION.lat);
    setSelectedLng(address.lng ?? DEFAULT_LOCATION.lng);
    setEditingAddressId(address.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    resetForm();
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const savedAddress: Address = {
      id: editingAddressId ?? `ADDR-${Date.now()}`,
      name,
      street,
      city,
      state: stateProvince,
      zip: zipCode,
      phone: user?.phone ?? "",
      isDefault: editingAddressId
        ? user.addresses.find(address => address.id === editingAddressId)?.isDefault ?? false
        : user.addresses.length === 0,
      lat: selectedLat,
      lng: selectedLng,
    };

    const nextAddresses = editingAddressId
      ? user.addresses.map(address => address.id === editingAddressId ? savedAddress : address)
      : [...user.addresses, savedAddress];

    const updatedUser = {
      ...user,
      addresses: nextAddresses
    };

    try {
      const usersStr = localStorage.getItem("greenmart_users");
      const users = usersStr ? JSON.parse(usersStr) : [];
      const updatedUsers = users.map((u: any) => u.id === user.id ? updatedUser : u);
      
      localStorage.setItem("greenmart_users", JSON.stringify(updatedUsers));
      localStorage.setItem("greenmart_current_user", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
    }
    
    setIsAdding(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    const remainingAddresses = user.addresses.filter(a => a.id !== id);
    const shouldPromoteDefault = remainingAddresses.length > 0 && !remainingAddresses.some(a => a.isDefault);
    const nextAddresses = shouldPromoteDefault
      ? remainingAddresses.map((address, index) => ({ ...address, isDefault: index === 0 }))
      : remainingAddresses;

    const updatedUser = {
      ...user,
      addresses: nextAddresses
    };

    try {
      const usersStr = localStorage.getItem("greenmart_users");
      const users = usersStr ? JSON.parse(usersStr) : [];
      const updatedUsers = users.map((u: any) => u.id === user.id ? updatedUser : u);
      
      localStorage.setItem("greenmart_users", JSON.stringify(updatedUsers));
      localStorage.setItem("greenmart_current_user", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-mint-50/30">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <Link href="/account" className="inline-flex items-center gap-1.5 text-mint-800 hover:text-mint-900 mb-6 font-semibold transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          {isAdding ? (
            <div className="bg-white rounded-3xl border border-mint-200 p-6 md:p-8 relative shadow-sm animate-in duration-300 max-w-4xl mx-auto">
              <button 
                onClick={handleCancel} 
                className="absolute top-5 right-5 bg-mint-50 hover:bg-mint-100 text-mint-700 hover:text-mint-900 p-2.5 rounded-full border border-mint-150 transition-colors cursor-pointer z-20 shadow-xs"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-mint-900 mb-6 border-b border-mint-100 pb-4">
                {editingAddressId ? "Edit Address Details" : "Add New Address"}
              </h2>

              <form onSubmit={handleSaveAddress} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Fields - Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-2.5">Address Label</label>
                    <div className="flex gap-3">
                      {['Home', 'Work', 'Other'].map(label => (
                        <button 
                          key={label}
                          type="button"
                          onClick={() => setName(label)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            name === label 
                            ? 'bg-mint-700 text-white shadow-md shadow-mint-700/10 border-mint-600' 
                            : 'bg-mint-50 text-mint-800 hover:bg-mint-100 border-mint-150'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-2">City</label>
                    <input 
                      required 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-mint-50/50 border border-mint-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-600/50 focus:border-mint-600 text-mint-900 placeholder-mint-400/60 font-medium" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-2">Street & Building</label>
                    <input 
                      required 
                      type="text" 
                      value={street} 
                      onChange={e => setStreet(e.target.value)}
                      placeholder="e.g. Ring Road, Block A"
                      className="w-full px-4 py-3 bg-mint-50/50 border border-mint-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-600/50 focus:border-mint-600 text-mint-900 placeholder-mint-400/60 font-medium" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-2">State / Province</label>
                      <input 
                        required 
                        type="text" 
                        value={stateProvince} 
                        onChange={e => setStateProvince(e.target.value)}
                        placeholder="e.g. Bagmati"
                        className="w-full px-4 py-3 bg-mint-50/50 border border-mint-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-600/50 focus:border-mint-600 text-mint-900 placeholder-mint-400/60 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-2">Zip / Postal Code</label>
                      <input 
                        required 
                        type="text" 
                        value={zipCode} 
                        onChange={e => setZipCode(e.target.value)}
                        placeholder="e.g. 44600"
                        className="w-full px-4 py-3 bg-mint-50/50 border border-mint-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-600/50 focus:border-mint-600 text-mint-900 placeholder-mint-400/60 font-medium" 
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full md:w-auto bg-mint-700 text-white font-bold hover:bg-mint-800 active:bg-mint-900 px-10 py-3 rounded-full text-sm transition-all shadow-md shadow-mint-700/10 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      {editingAddressId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </div>

                {/* Map Picker Widget - Right Column */}
                <div className="space-y-4 flex flex-col h-full">
                  <label className="block text-xs font-bold uppercase tracking-wider text-mint-800 mb-0.5">Pin Location on Map</label>
                  <div className="flex-grow">
                    <MapPicker 
                      initialPosition={{ lat: selectedLat, lng: selectedLng }}
                      onLocationSelect={handleLocationSelect} 
                      onAddressExtracted={handleAddressExtracted} 
                    />
                  </div>
                  <p className="text-xs text-mint-650 text-center">Click anywhere on the map or use Detect Location to fetch your precise area.</p>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-mint-200/80 overflow-hidden shadow-sm max-w-5xl mx-auto animate-in duration-300">
              
              {/* Premium Header Banner Area showing dynamic Name and Profile Avatar */}
              <div className="bg-gradient-to-r from-mint-850 via-mint-750 to-mint-600 p-8 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl"></div>
                
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user.firstName} ${user.lastName}`} 
                    className="w-20 h-20 rounded-full object-cover shrink-0 border-4 border-white/20 shadow-md transform hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white text-2xl font-black shrink-0 border-4 border-white/25 uppercase shadow-md transform hover:scale-105 transition-transform duration-300">
                    {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
                  </div>
                )}
                
                <div className="text-center sm:text-left relative z-10">
                  <h1 className="text-xl md:text-2xl font-black mb-1 tracking-tight">{user.firstName} {user.lastName}</h1>
                  <p className="text-mint-100/90 text-xs font-semibold">Address Settings & Locations</p>
                </div>

                <div className="flex gap-4 shrink-0 sm:ml-auto relative z-10">
                  <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[85px] shadow-sm">
                    <div className="text-lg font-black text-white">{user.addresses?.length || 0}</div>
                    <div className="text-[9px] uppercase font-bold text-mint-150 tracking-wider">Addresses</div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-mint-100">
                  <h2 className="text-xl font-bold text-mint-900">Saved Addresses</h2>
                  <button 
                    onClick={handleAddNew}
                    className="bg-mint-700 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-mint-800 active:bg-mint-900 transition-all shadow-md shadow-mint-700/10 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-4.5 h-4.5" /> Add New
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.addresses.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-mint-655 bg-mint-50/20 rounded-3xl border border-mint-150">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30 text-mint-500 animate-bounce" />
                      <p className="font-bold text-mint-800 text-base">No saved addresses yet.</p>
                      <p className="text-sm text-mint-600 mt-1">Add your shipping details for rapid courier dispatch!</p>
                    </div>
                  ) : (
                    user.addresses.map((address) => {
                      const mapLat = address.lat ?? DEFAULT_LOCATION.lat;
                      const mapLng = address.lng ?? DEFAULT_LOCATION.lng;

                      return (
                        <div 
                          key={address.id} 
                          className="overflow-hidden rounded-3xl relative border border-mint-150 bg-white hover:border-mint-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-[300px]"
                        >
                          {/* Zoomed Map Display Header */}
                          <div className="relative h-[140px] shrink-0 overflow-hidden border-b border-mint-150 pointer-events-none">
                            <StaticMap lat={mapLat} lng={mapLng} />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>
                            {address.isDefault && (
                              <span className="absolute top-3 right-3 bg-mint-700 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-mint-600 shadow-md z-10 uppercase tracking-wider">
                                Default
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2.5 p-3 border-b border-mint-150 bg-mint-50/20 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEdit(address)}
                              className="flex-1 bg-mint-50 hover:bg-mint-100 border border-mint-150 hover:border-mint-250 text-xs font-bold text-mint-850 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(address.id)}
                              className="flex-1 bg-red-50 hover:bg-red-100 border border-red-150 hover:border-red-250 text-xs font-bold text-red-600 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>

                          {/* Details Area */}
                          <div className="flex-grow p-4 flex flex-col justify-between min-h-0 bg-white">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="inline-flex items-center rounded bg-mint-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-mint-800 border border-mint-100">
                                {address.name}
                              </span>
                            </div>

                            <div className="min-w-0 flex-grow flex flex-col justify-end pb-1">
                              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mint-500 mb-0.5">
                                Street Name
                              </p>
                              <h3 className="truncate text-base font-bold leading-tight text-mint-900">
                                {address.street}
                              </h3>
                              <p className="truncate text-xs font-medium text-mint-700 mt-1">
                                {address.city}, {address.state}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
