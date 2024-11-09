const Users = [
  { UserID: 2, UserLogin: "AdminCP" },
  { UserID: 67, UserLogin: "Aranami Sakado" },
  // TODO
];

function addUserToList(userId) {
  const user = Users.find(u => u.id === userId);
  if (user) {
    const userList = document.querySelectorAll('userList');
    if (!userList.innerHTML.includes(user.username)) { 
      userList.innerHTML += `<li>${user.username}</li>`;
    }
  }
}
