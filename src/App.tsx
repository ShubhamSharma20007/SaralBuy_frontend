import{ useEffect } from "react";
import "./App.css";
import { useCategoriesStore } from "./zustand/getCategories";
import { getUserProfile } from "./zustand/userProfile";
// import "@fontsource/poppins"; // Imports the default 400 weight
import "@fontsource/poppins/400.css"; // Imports the regular 400 weight
import "@fontsource/poppins/600.css"; // Imports the bold 700 weight
import AppRouters from "./Routes";
function App() {
 const categories = useCategoriesStore()
 const userProfile = getUserProfile();
useEffect(() => {
  Promise.all([categories.execute(),
  userProfile.execute()]).catch(err => console.log(err))
}, [])


  return <AppRouters/>
}

export default App;
