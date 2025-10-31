import { Outlet } from "react-router-dom";

const ProductLayout = () => {
  return (

   <> 
      <div className="bg-gray-100 p-6 rounded-2xl">
        <Outlet />
      </div>
   </>
  );
};

export default ProductLayout;
