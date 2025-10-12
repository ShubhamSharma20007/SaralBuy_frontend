import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../Components/ui/breadcrumb";
import { Outlet, useNavigate } from "react-router-dom";
import { Camera, House, SquarePen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../Components/ui/avatar";
import { NavLink } from 'react-router-dom';
import { useFetch } from "@/helper/use-fetch";
import userService from "@/services/user.service";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getUserProfile } from "@/zustand/userProfile";
import { fallBackName } from "@/helper/fallBackName";
import { Spinner } from "@/Components/ui/shadcn-io/spinner";
 const getRoutePath = (value: string) => {
    switch (value) {
      case 'profile':
        return '/account';
      case 'your_biding':
        return '/account/bid';
      case 'requirements':
        return '/account/requirements';
      case 'your_deal':
        return '/account/deal';
      case 'notifications':
        return '/account/notification';
      case 'cart':
        return '/account/cart';
      default:
        return '/account';
    }
  };


const tags = [
  {
    title: 'Profile',
    value: 'profile'
  },
  {
    title: "Cart",
    value: 'cart'
  },
  {
    title: "Your Biding",
    value: 'your_biding'
  }, {
    title: "Requirements",
    value: 'requirements'
  }, {
    title: "Your Deal",
    value: 'your_deal'
  },
  {
    title: 'Notifications',
    value: 'notifications'
  }
]

const Profile = () => {
  const {user,setUser} = getUserProfile()
  const navigate =useNavigate()
   const { fn: updateProfilefn, data: updateProfileRes, loading:updateProfileLoading } = useFetch(userService.updateProfile)
  const avatarRef = useRef<HTMLInputElement>(null)
   const handleUpdateProfile = async () => {
    const formData = new FormData()
   if(avatarRef.current && avatarRef.current.files){
    formData.append('image', avatarRef.current.files[0])
   }
   await updateProfilefn(formData)
   }

   useEffect(()=>{
    if(updateProfileRes){
      setUser(updateProfileRes)
      toast.success('Profile updated successfully')
    }
   },[updateProfileRes])

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6 px-4">
      {/* Breadcrumb */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <BreadcrumbPage className="capitalize font-regular text-gray-500"><House className="w-5 h-5"/></BreadcrumbPage>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="capitalize font-regular text-orange-600 font-semibold">Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8">
        <div className="grid gap-8 md:grid-cols-[230px_1fr]">
          {/* Sidebar */}
          <div className="hidden md:block space-y-2 bg-gray-200/50 p-4 rounded-md  sticky top-4  self-start">
            <div className='flex justify-center items-center mt-2 mb-5 relative'>
              <div className='relative'>
                <Avatar className='w-28 h-28 border-gray-600 border-3 flex '>
                {
                  updateProfileLoading ? 
                  <div className="h-full w-full  flex items-center justify-center object-contain">
                    <Spinner className="w-5 h-5 text-orange-500"/>
                    
                  </div>:
                  <AvatarImage src={user?.profileImage || '/avatar.jpg'} className="w-full h-full object-contain rounded-full"/>
                }
                
                {
                  !updateProfileLoading && user?.profileImage && <AvatarFallback>{fallBackName(`${user?.firstName} ${user?.lastName}`)}</AvatarFallback>
                }
                </Avatar>
                <input type="file" name="image" hidden id="" ref={avatarRef} onChange={handleUpdateProfile} />
                <button
                disabled={updateProfileLoading}
                onClick={(e)=>{
                  e.preventDefault()
                  if(avatarRef){
                    avatarRef.current?.click()
                  }
                }}  className="absolute bottom-4 cursor-pointer right-0 bg-gray-500 p-1 rounded-full shadow-md hover:bg-gray-400">
                  <Camera className='w-4 h-4 text-white' />
                </button>
              </div>
            </div>
              <span className="mb-5 block text-md underline text-center font-semibold text-gray-700">Update Photo</span>

            <div className="grid gap-1 text-gray-600">
              {tags.map((tag) => {
                const routePath = getRoutePath(tag.value);
                return (
                  <NavLink
                    key={tag.title}
                    to={routePath}
                    end={tag.value === 'profile'}
                    className={({ isActive }) =>
                      `text-left px-3 py-2 cursor-pointer text-sm rounded-md hover:bg-gray-200/90 ${isActive ? 'bg-gray-200/90 text-gray-600 font-semibold' : ''
                      }`
                    }
                  >
                    {tag.title}
                  </NavLink>
                );
              })}
            </div>

          </div>

          {/* Main Content */}
          <div className="space-y-10">
            <section  >
              <Outlet />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
