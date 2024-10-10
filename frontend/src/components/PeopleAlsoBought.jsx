import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import LoadingSpinner from "./LoadingSpinner";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const PeopleAlsoBought = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await axiosInstance.get(
                    "/products/recommendations"
                );
                setRecommendations(res.data);
            } catch (error) {
                toast.error(
                    error.response.data.message ||
                        "An error occurred while fetching the recommendations"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="mt-8">
            <h3 className="text-2xl from-semibold text-emerald-400">
                People also bought
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default PeopleAlsoBought;
