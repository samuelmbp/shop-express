import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    setProducts: (products) => set({ products }),

    createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false,
            }));
            toast.success("Product created successfully");
        } catch (error) {
            toast.error(
                error.response.data.message ||
                    "An error occurred when creating a product"
            );
            set({ loading: false });
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get("/products");
            set({ products: res.data.products, loading: false });
        } catch (error) {
            set({ loading: false, error: "Failed to fetch products" });
            toast.error(
                error.response.data.message || "Failed to fetch products"
            );
        }
    },
    deleteProduct: async (productId) => {},
    toggleFeaturedProduct: async (productId) => {},
}));
