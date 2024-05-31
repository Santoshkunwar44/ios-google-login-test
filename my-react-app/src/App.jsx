// // src/App.jsx
// import  { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css"

// const App = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_ROOT_URL}/api/auth/user`,
//           { withCredentials: true }
//         );
//         setUser(response.data.user);
//       } catch (error) {
//         console.error("Error fetching user", error);
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleGoogleLogin = (device) => {
//     if (device === "ios") {
//       console.log("ios")
//       window.location.href = `${
//         import.meta.env.VITE_BACKEND_ROOT_URL
//       }/api/auth/google`;
//     } else {
//       console.log("android");

//       window.open(`${import.meta.env.VITE_BACKEND_ROOT_URL}/api/auth/google`, "_self");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Google Login Example</h1>
//       {user ? (
//         <div>
//           <h2>Welcome, {user.name}</h2>
//           <p>Email: {user.email}</p>
//           <button
//             onClick={() =>
//               (window.location.href = `${
//                 import.meta.env.VITE_BACKEND_ROOT_URL
//               }/api/auth/logout`)
//             }
//           >
//             Logout
//           </button>
//         </div>
//       ) : (
//         <div>
//           <button onClick={()=>handleGoogleLogin("andriod")}>Login with Google 1 </button>
//           <button onClick={()=>handleGoogleLogin("ios")}>Login with Google 2</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import { useEffect } from "react";
import  {jwtDecode} from "jwt-decode"

const clientId =
  "382936987558-kqm107qurgtgrjlgpv1sfejl33n3q5u3.apps.googleusercontent.com";

const App = () => {
  useEffect(() => {

   /* global google */
    google.accounts.id.initialize({
      client_id: clientId,
      callback:handleCallbackReponse,
    })

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      {theme:"outline",size:"large"}
    )

    google.accounts.id.prompt()
  }, []);
  const handleCallbackReponse = (authResult) => {
    console.log(authResult);
    const payload = jwtDecode(authResult.credential);
    console.log(payload)
  };

  return (
    <div className="App">
      <h1>Google Login Example</h1>
      <div id="signInDiv">

      </div>
    </div>
  );
};
export default App;
