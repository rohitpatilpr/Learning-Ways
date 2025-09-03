import "./App.css";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home"
import Navbar from "./components/comman/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";

import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import About from "./pages/About";
import Error from "./pages/Error"
import Contact from "./pages/Contact";

import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute"
import MyProfile from "./components/core/DashboardPage/MyProfile";
import Settings from "./components/core/DashboardPage/Settings";
import EnrolledCourses from "./components/core/DashboardPage/EnrolledCourses";
import Cart from "./components/core/CartPage/index"
import AddCourse from "./components/core/DashboardPage/AddCourse";
import { useDispatch , useSelector} from "react-redux";


import { ACCOUNT_TYPE } from "./utils/constants";
import MyCourses from "./components/core/DashboardPage/MyCourses";
import EditCourse from "./components/core/DashboardPage/EditCourse";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import ViewPage from "./pages/ViewPage";
import PurchhaseHistory from "./components/core/DashboardPage/PurchhaseHistory";
import Instructor from "./components/core/DashboardPage/Instructor";
function App() {

  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation()
  
  
  const { user } = useSelector((state) => state.profile)
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex-col font-inter">

  
    <Navbar/>
   

    <Routes>

        <Route path="/" element={<Home />} />
        <Route path="catalog/:catalogName" element={<Catalog/>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        {/* <Route path="catalog/:catalogName" element={<Catalog />} /> */}


      <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />  

          <Route
          path="login"
          element={
            <OpenRoute>
             <Login/>
            </OpenRoute>
          }
        />  
        

        <Route
          path="forgot-password"
          element={
            <OpenRoute>
            <ForgotPassword/>
            </OpenRoute>
          }
        />  
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
          <UpdatePassword/>
            </OpenRoute>
          }
        />  


        {/* private route for only logged in users  */}
        <Route element={
          <PrivateRoute>
            <Dashboard/>
          </PrivateRoute>
        }>

                  {/* route for all user  */}
                  <Route path="dashboard/my-profile" element={<MyProfile/>}/>
                  <Route path="dashboard/settings" element={<Settings/>}/>

                
                {
                user?.accountType === ACCOUNT_TYPE.STUDENT && (
                  <>
                  {/* route for only student  */}
                  <Route path="dashboard/enrolled-courses" element={<EnrolledCourses/>}/>
                  <Route path="/dashboard/purchase-history" element={<PurchhaseHistory/>}/>
                  <Route path="dashboard/cart" element={<Cart/>}/>

                  </>
                )
                }
                
                {
                user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
                  <>
                  {/* route for only student  */}
                  <Route path="dashboard/instructor" element={<Instructor />} />
                  <Route path="dashboard/add-course" element={<AddCourse/>}/>
                  <Route path="dashboard/my-courses" element={<MyCourses/>}/>
                  <Route path="dashboard/edit-course/:courseId" element={<EditCourse/>}/>
                  
                  </>
                )
                }

        </Route>


       <Route
       element={
        <PrivateRoute>
          <ViewPage/>
        </PrivateRoute>
       }
       >
       {user?.accountType===ACCOUNT_TYPE.STUDENT &&(
        <>
          <Route 
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId" 
            element={<VideoDetails/>}
          />
        </>
       )}
      
       </Route>

        <Route path="*" element={<Error/>}/>
    </Routes>

    </div>
  );
}

export default App;
