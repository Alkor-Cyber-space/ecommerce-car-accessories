import { Outlet } from "react-router-dom";

const ProductLayout = () => {
  return (

   <> 
      <div className="bg-[#ECECF0] px-4 sm:px-6 py-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <Outlet />
      </div>
   </>
  );
};

export default ProductLayout;
