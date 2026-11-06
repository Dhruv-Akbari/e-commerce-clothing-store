import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import useUserId from "../../context/useUserId";


import { 
  AddAddress, 
  getUserAddresses, 
  updateAddressAPI, 
  deleteAddressAPI 
} from "../../api/api";

const emptyAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const Addaddress = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const userId = useUserId();

  useEffect(() => {
    const fetchdata = async () => {
      try {
        // Wait until userId is available
        if (!userId) {
          console.error("No user ID found! Please log in.");
          return;
        }

        const data = await getUserAddresses(userId);

        const addressList = Array.isArray(data)
          ? data
          : data?.addresses || data?.data || [];

        const mappedList = addressList.map((addr) => {
          let parsedId = addr.id;

          if (!parsedId && addr._id) {
            parsedId =
              typeof addr._id === "object" && addr._id.$oid
                ? addr._id.$oid
                : addr._id;
          }

          return { ...addr, id: parsedId };
        });

        setAddresses(mappedList);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setAddresses([]);
      }
    };

    fetchdata();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyAddress);
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const address = {
      ...formData,
      isDefault:
        editingId !== null
          ? addresses.find((item) => item.id === editingId)?.isDefault || false
          : addresses.length === 0,
    };

    try {
      setLoading(true);

      if (editingId !== null) {
        // --- API INTEGRATION: UPDATE ADDRESS ---
        await updateAddressAPI(editingId, address);
        
        setAddresses((prev) =>
          prev.map((item) => (item.id === editingId ? { ...address, id: editingId } : item)),
        );
        setMessage("Address updated successfully.");
      } else {
        // --- API INTEGRATION: ADD ADDRESS ---
        const response = await AddAddress(address);

        if (response) {
          const newAddress = response.address || address;
          // Ensure we capture the DB-generated _id for future edits/deletes
          if (newAddress._id && !newAddress.id) newAddress.id = newAddress._id;
          
          setAddresses((prev) => [...prev, newAddress]);
          setMessage("Address saved successfully.");
        } else {
          throw new Error("Failed to get a response from the server");
        }
      }

      resetForm();
    } catch (error) {
      console.error("Could not save address:", error);
      setMessage("Unable to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      email: address.email || "",
      addressLine: address.addressLine || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    });

    setEditingId(address.id || address._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      // --- API INTEGRATION: DELETE ADDRESS ---
      await deleteAddressAPI(id);

      setAddresses((prev) => {
        const remaining = prev.filter((item) => item.id !== id);
        if (remaining.length && !remaining.some((item) => item.isDefault)) {
          remaining[0] = { ...remaining[0], isDefault: true };
          // Optionally: You could also trigger a PUT request here to update the new default address in the backend
        }
        return remaining;
      });

      if (editingId === id) resetForm();
      setMessage("Address deleted successfully.");
    } catch (error) {
      console.error("Could not delete address:", error);
      setMessage("Failed to delete address. Try again.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const addressToUpdate = addresses.find(a => a.id === id);
      if(addressToUpdate) {
        // --- API INTEGRATION: UPDATE DEFAULT ADDRESS ---
        await updateAddressAPI(id, { ...addressToUpdate, isDefault: true });
        
        setAddresses((prev) =>
          prev.map((item) => ({
            ...item,
            isDefault: item.id === id,
          })),
        );
      }
    } catch(error) {
      console.error("Failed to set default:", error);
      setMessage("Failed to update default address.");
    }
  };

  const fields = [
    {
      name: "fullName",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      autoComplete: "name",
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      required: true,
      type: "tel",
      autoComplete: "tel",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "Enter your email",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "addressLine",
      label: "House No. / Street Address",
      placeholder: "Flat, house number, street",
      required: true,
      autoComplete: "street-address",
      fullWidth: true,
    },
    {
      name: "landmark",
      label: "Landmark",
      placeholder: "Nearby landmark (optional)",
      fullWidth: true,
    },
    {
      name: "city",
      label: "City",
      placeholder: "Enter city",
      required: true,
      autoComplete: "address-level2",
    },
    {
      name: "state",
      label: "State",
      placeholder: "Enter state",
      required: true,
      autoComplete: "address-level1",
    },
    {
      name: "pincode",
      label: "PIN Code",
      placeholder: "6-digit PIN code",
      required: true,
      autoComplete: "postal-code",
      maxLength: 6,
    },
    {
      name: "country",
      label: "Country",
      placeholder: "Enter country",
      required: true,
      autoComplete: "country-name",
    },
  ];

  // FIX: Provide a fallback array to prevent crash if somehow addresses becomes undefined
  const safeAddresses = Array.isArray(addresses) ? addresses : [];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#171717]">
      <Navbar />

      <main className="px-5 md:px-12 lg:px-20 py-10 md:py-14">
        {/* Page Heading */}
        <div className="max-w-6xl mx-auto mb-10">
          <button
            type="button"
            onClick={() => navigate("/Home")}
            className="text-sm text-gray-500 hover:text-black transition mb-6"
          >
            ← Back to Home
          </button>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Your personal details
          </p>
          <h1 className="text-4xl md:text-6xl font-light mt-3 tracking-tight">
            Your <span className="italic">addresses.</span>
          </h1>
          <p className="text-gray-500 mt-4 max-w-lg leading-relaxed">
            Manage your delivery details for a smoother and more effortless
            shopping experience.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          {/* Address Form */}
          <section className="relative overflow-hidden rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 md:p-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d8c3a5]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                {editingId !== null ? "Edit details" : "Delivery information"}
              </p>
              <h2 className="text-2xl md:text-3xl font-light mt-3 mb-8">
                {editingId !== null ? "Update address" : "Add a new address"}
              </h2>
              {message && (
                <p
                  role="status"
                  className="text-sm text-gray-700 bg-white/70 border border-black/5 rounded-xl p-4 mb-6"
                >
                  {message}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-5">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={field.fullWidth ? "sm:col-span-2" : ""}
                    >
                      <label
                        htmlFor={field.name}
                        className="block text-sm mb-2 text-gray-600"
                      >
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required || false}
                        autoComplete={field.autoComplete}
                        maxLength={field.maxLength}
                        pattern={
                          field.name === "pincode"
                            ? "[0-9]{6}"
                            : field.name === "phone"
                              ? "[0-9+() -]{7,20}"
                              : undefined
                        }
                        title={
                          field.name === "pincode"
                            ? "Enter a valid 6-digit PIN code"
                            : undefined
                        }
                        className="w-full rounded-xl border border-white bg-white/60 backdrop-blur-md px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-7 py-4 rounded-full bg-black text-white text-sm tracking-wide hover:bg-gray-800 active:scale-95 transition disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingId !== null
                        ? "Update Address"
                        : "Save Address"}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-7 py-4 rounded-full bg-white/70 border border-white text-sm hover:bg-white transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          {/* Saved Addresses */}
          <section>
            <div className="flex items-end justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                  Your saved details
                </p>
                <h2 className="text-2xl md:text-3xl font-light mt-3">
                  Saved <span className="italic">addresses.</span>
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {safeAddresses.length} saved
              </span>
            </div>

            {safeAddresses.length === 0 ? (
              <div className="rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/70 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl">⌂</span>
                </div>
                <h3 className="text-xl font-light">No addresses yet</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  Add your first delivery address using the form. Your saved
                  details will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {safeAddresses.map((address) => (
                  <article
                    key={address.id}
                    className="relative rounded-[1.75rem] overflow-hidden bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_12px_35px_rgba(0,0,0,0.04)] p-6 md:p-7"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium break-words">
                          {address.fullName}
                        </h3>
                        {address.isDefault && (
                          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#e5e0d5] text-[10px] uppercase tracking-[0.15em]">
                            Default address
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {address.country}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 leading-7 mt-4 break-words">
                      <p>{address.addressLine}</p>
                      {address.landmark && <p>Near {address.landmark}</p>}
                      <p>
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="mt-2">{address.phone}</p>
                      {address.email && <p>{address.email}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => handleEdit(address)}
                        className="px-4 py-2.5 rounded-full bg-black text-white text-xs hover:bg-gray-800 transition"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address.id)}
                          className="px-4 py-2.5 rounded-full bg-white/70 border border-white text-xs hover:bg-white transition"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="px-4 py-2.5 rounded-full bg-white/70 border border-white text-xs text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Addaddress;