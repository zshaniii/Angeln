const AUTH_USERS_KEY = 'anglerAppUsers';
const AUTH_CURRENT_KEY = 'anglerAppCurrent';
const PRO_CODES = ['FREIPRO', 'PRO2026', 'ANGELPRO'];

function getUsers(){
  try{
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {};
  }catch(e){
    return {};
  }
}

function saveUsers(users){
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getCurrentUser(){
  return localStorage.getItem(AUTH_CURRENT_KEY);
}

function setCurrentUser(username){
  localStorage.setItem(AUTH_CURRENT_KEY, username);
}

function clearCurrentUser(){
  localStorage.removeItem(AUTH_CURRENT_KEY);
}

function getCurrentUserData(){
  const username = getCurrentUser();
  if(!username) return null;
  return getUsers()[username] || null;
}

function isLoggedIn(){
  return !!getCurrentUserData();
}

function getUserRole(){
  const user = getCurrentUserData();
  return user ? user.role : 'guest';
}

function isPro(){
  return getUserRole() === 'pro';
}

function getTodayKey(name){
  const day = new Date().toISOString().slice(0,10);
  return `${AUTH_USERS_KEY}:${name}:${day}`;
}

function getDailyUsage(name){
  try{
    return Number(localStorage.getItem(getTodayKey(name))) || 0;
  }catch(e){
    return 0;
  }
}

function registerDailyUsage(name, amount = 1){
  const key = getTodayKey(name);
  const current = getDailyUsage(name);
  localStorage.setItem(key, String(current + amount));
}

function canAccessPruefungsfragen(){
  if(isPro()) return true;
  if(isLoggedIn()) return getDailyUsage('pruefungsfragen') < 100;
  return getDailyUsage('pruefungsfragen') < 30;
}

function getPruefungsfragenRemaining(){
  if(isPro()) return Infinity;
  if(isLoggedIn()) return Math.max(0, 100 - getDailyUsage('pruefungsfragen'));
  return Math.max(0, 30 - getDailyUsage('pruefungsfragen'));
}

function canAccessFischkundeLevel(level){
  if(isPro() || isLoggedIn()) return true;
  return level.toLowerCase() === 'leicht';
}

function canAccessRutenbauRoute(){
  if(isPro()) return true;
  if(isLoggedIn()) return getDailyUsage('rutenbauRoute') < 4;
  return getDailyUsage('rutenbauRoute') < 1;
}

function getRutenbauRoutesRemaining(){
  if(isPro()) return Infinity;
  if(isLoggedIn()) return Math.max(0, 4 - getDailyUsage('rutenbauRoute'));
  return Math.max(0, 1 - getDailyUsage('rutenbauRoute'));
}

function registerRutenbauRoute(){
  if(isPro()) return;
  registerDailyUsage('rutenbauRoute');
}

function canAccessProbePruefung(){
  return isPro();
}

function getCurrentUserProfile(){
  const user = getCurrentUserData();
  return user ? user.profile || {} : {};
}

function saveCurrentUserProfile(profileUpdates){
  const username = getCurrentUser();
  if(!username) return false;
  const users = getUsers();
  const user = users[username];
  if(!user) return false;
  user.profile = Object.assign(user.profile || {}, profileUpdates);
  users[username] = user;
  saveUsers(users);
  return true;
}

function saveCurrentUserAvatar(dataUrl){
  return saveCurrentUserProfile({ avatar: dataUrl });
}

function registerUser(username, password){
  const users = getUsers();
  if(!username || !password || users[username]) return false;
  users[username] = { password, role: 'user', profile: {} };
  saveUsers(users);
  setCurrentUser(username);
  return true;
}

function loginUser(username, password){
  const users = getUsers();
  if(!users[username] || users[username].password !== password) return false;
  setCurrentUser(username);
  return true;
}

function logout(){
  clearCurrentUser();
}

function upgradeCurrentUserToPro(code){
  const normalized = code ? code.trim().toUpperCase() : '';
  if(!PRO_CODES.includes(normalized)) return false;
  const username = getCurrentUser();
  if(!username) return false;
  const users = getUsers();
  if(!users[username]) return false;
  users[username].role = 'pro';
  saveUsers(users);
  return true;
}

function getUserDisplayName(){
  const user = getCurrentUserData();
  if(!user) return 'Gast';
  return user.profile?.fullName || getCurrentUser();
}

function ensureAuthRedirect(target){
  if(!isLoggedIn()){
    window.location.href = target || 'login.html';
    return false;
  }
  return true;
}
