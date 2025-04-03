// import React, { useState } from "react";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../../firebase";
// import { getUsers } from "../../api/apiService";
// import { toast } from "react-toastify";

// const EditUser = ({ selectedUser, setUsers, setIsEditing }) => {
//   const id = selectedUser.id;

//   const [email, setEmail] = useState(selectedUser.email);
//   const [name, setName] = useState(selectedUser.name);

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     if (!email || !name) {
//       toast.error("All fields are required.", {
//         position: "top-center", // Can override position set in CustomToast if needed
//         autoClose: 3000,
//       });
//       return;
//     }

//     const user = {
//       id,
//       email,
//       name,
//     };

//     await setDoc(doc(db, "users", id), {
//       ...user,
//     });

//     toast.success("Successfully updated!", {
//       position: "top-center", // Can override position set in CustomToast if needed
//       autoClose: 3000,
//     });

//     const updatedUsers = await getUsers();
//     setUsers(updatedUsers);
//     setIsEditing(false);

//     getUsers();
//   };

//   return (
//     <div className="small-container">
//       <form onSubmit={handleUpdate}>
//         <h2 className="font-bold mb-4">Edit User</h2>
//         <label className="font-bold mb-4" htmlFor="email">
//           Email
//         </label>
//         <input
//           id="email"
//           type="email"
//           disabled
//           name="email"
//           className="w-full text-black py-2 mb-4 border border-gray-300 focus:outline-none "
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <label className="font-bold mb-4" htmlFor="name">
//           Name
//         </label>
//         <input
//           id="name"
//           type="text"
//           name="name"
//           className="w-full text-black py-2 mb-4 border border-gray-300 focus:outline-none "
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <div className="mt-10">
//           <input
//             className={
//               "border border-gray-300 px-4 py-2 rounded hover:border-gray-500 hover:bg-gray-200"
//             }
//             type="submit"
//             value="Update"
//           />
//           <input
//             className={
//               "border border-gray-300 px-4 py-2 rounded hover:border-gray-500 hover:bg-gray-200"
//             }
//             style={{ marginLeft: "12px" }}
//             type="button"
//             value="Cancel"
//             onClick={() => setIsEditing(false)}
//           />
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditUser;
