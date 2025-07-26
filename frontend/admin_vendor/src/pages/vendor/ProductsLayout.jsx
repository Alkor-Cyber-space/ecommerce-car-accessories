import { Outlet } from "react-router-dom";

const ProductLayout = () => {
  return (

   <> 
      <div className="bg-[#ECECF0] px-4 sm:px-6 py-8 rounded-2xl">
        <Outlet />
      </div>
   </>
  );
};

export default ProductLayout;
