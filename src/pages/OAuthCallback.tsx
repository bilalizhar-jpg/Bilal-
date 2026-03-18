import React, { useEffect} from 'react';

export default function OAuthCallback() {
 useEffect(() => {
 // Parse the hash or query parameters to get the access token
 const hash = window.location.hash.substring(1);
 const params = new URLSearchParams(hash || window.location.search);
 const accessToken = params.get('access_token');
 const code = params.get('code');

 // Send success message to parent window and close popup
 if (window.opener) {
 window.opener.postMessage({ 
 type: 'OAUTH_AUTH_SUCCESS',
 payload: { accessToken, code}
}, '*');
 window.close();
} else {
 window.location.href = '/';
}
}, []);

 return (
 <div className="min-h-screen flex items-center justify-center bg-[#1E1E2F] text-white">
 <div className="text-center">
 <div className="w-12 h-12 border-4 border-[#00FFCC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
 <p className="text-lg font-bold">Authentication successful!</p>
 <p className="text-sm text-[#B0B0C3]">This window should close automatically.</p>
 </div>
 </div>
 );
}
