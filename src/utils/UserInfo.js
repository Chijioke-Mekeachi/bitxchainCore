// UserInfo.js
export let username = "";
export let email = "";
export let busername = "";
export let memo = "";

export const setUserInfo = (user) => {
  username = user.username;
  email = user.email;
  busername = user.busername;
  memo = user.memo;
};
