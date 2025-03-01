// import React, { useState, useEffect } from "react";
// import Table from "../../components/Table";
// import EditUser from "./EditUser";
// import { getUsers } from "../../api/apiService";
// import CustomModal from "../../components/CustomModal";

// const UsersPage = () => {
//   const [users, setUsers] = useState();
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);

//   const fetchUsers = async () => {
//     try {
//       const data = await getUsers();
//       console.log(data);
//       setUsers(data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleEdit = (id) => {
//     const [user] = users.filter((user) => user.id === id);

//     setSelectedUser(user);
//     setIsEditing(true);
//   };

//   const columns = [
//     {
//       header: "Email",
//       accessor: "email",
//     },
//     {
//       header: "Name",
//       accessor: "name",
//     },
//   ];

//   return (
//     <div className="container">
//       <>
//         <Table columns={columns} data={users} handleEdit={handleEdit} />
//       </>
//       <CustomModal
//         isOpen={isEditing}
//         onRequestClose={() => setIsEditing(false)}
//       >
//         {selectedUser && (
//           <EditUser
//             selectedUser={selectedUser}
//             setUsers={setUsers}
//             setIsEditing={setIsEditing}
//           />
//         )}
//       </CustomModal>
//     </div>
//   );
// };

// export default UsersPage;
