const Users = [
  { id: 1, username: "AdminCP" },
  { id: 67, username: "Aranami Sakado" },
  // TODO
];

function addUserToList(userId) {
  const user = Users.find(u => u.id === userId);
  if (user) {
    const userList = document.getElementById('userList');
    if (!userList.innerHTML.includes(user.username)) { 
      userList.innerHTML += `<li>${user.username}</li>`;
    }
  }
}
