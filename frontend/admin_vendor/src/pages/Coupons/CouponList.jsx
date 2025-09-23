import React, { useState, useEffect } from 'react';
import { getAllCouponsApi } from '../../services/allAPI';
import CouponCard from './CouponCard';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await getAllCouponsApi();
        setCoupons(data.message || []);
        console.log(data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  // Handler to remove deleted coupon from state
  const handleDelete = (deletedId) => {
    setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== deletedId));
  };

  return (
    <div className="p-4 border-t mt-8">
      <h2 className="text-2xl font-bold mb-4">Available Coupons</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.length > 0 ? (
          coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onSelect={() => {
                setSelectedCoupon(coupon);
                setIsEditModalOpen(true);
              }}
              onDelete={handleDelete} // <-- Pass the handler here
            />
          ))
        ) : (
          <p>No coupons available.</p>
        )}
      </div>
    </div>
  );
};

export default CouponList;
