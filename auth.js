(function(){
  // Client-side auth helpers: grant full access to all features for guests.

  function isLoggedIn(){ return true; }
  function getCurrentUser(){ return localStorage.getItem('user') || 'Gast'; }
  function getUserRole(){ return 'pro'; }
  function isPro(){ return true; }

  function loginUser(username,password){
    if(username) localStorage.setItem('user', username);
    return true;
  }
  function logout(){ localStorage.removeItem('user'); }
  function registerUser(username,email,password){
    if(username) localStorage.setItem('user', username);
    return true;
  }

  // Access helpers used across the app — always allow.
  function canAccessProbePruefung(){ return true; }
  function canAccessPruefungsfragen(){ return true; }
  function canAccessFischkundeLevel(level){ return true; }
  function canAccessRutenbauRoute(){ return true; }

  // Rutenbau usage helpers (no-op/allow)
  function getRutenbauRoutesRemaining(){ return 999; }
  function registerRutenbauRoute(){ /* no-op: unlimited for guests */ }

  window.isLoggedIn = isLoggedIn;
  window.getCurrentUser = getCurrentUser;
  window.getUserRole = getUserRole;
  window.isPro = isPro;
  window.loginUser = loginUser;
  window.logout = logout;
  window.registerUser = registerUser;

  window.canAccessProbePruefung = canAccessProbePruefung;
  window.canAccessPruefungsfragen = canAccessPruefungsfragen;
  window.canAccessFischkundeLevel = canAccessFischkundeLevel;
  window.canAccessRutenbauRoute = canAccessRutenbauRoute;

  window.getRutenbauRoutesRemaining = getRutenbauRoutesRemaining;
  window.registerRutenbauRoute = registerRutenbauRoute;
})();
