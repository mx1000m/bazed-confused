import React from "react";

const ProfileCardCast = ({
  username = "@mx1000",
  score = 100,
  termsSubmitted = 10,
  avatar = "https://i.pravatar.cc/100?u=mx1000",
  onCast = () => alert("Cast to Farcaster!")
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-auto text-center">
      <h2 className="text-xl font-bold text-blue-600 mb-1">BAZED & CONFUSED</h2>
      <p className="text-sm text-gray-500 mb-4">Helping normies speak onchain fluently</p>

      <img
        src={avatar}
        alt="User avatar"
        className="w-20 h-20 rounded-full mx-auto mb-4 border border-gray-200"
      />

      <p className="text-lg font-semibold">{username}</p>

      <div className="mt-3 space-y-1">
        <p className="text-gray-700">
          <span className="font-semibold">Score:</span> {score} pts
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Terms Submitted:</span> {termsSubmitted}
        </p>
      </div>

      <button
        onClick={onCast}
        className="mt-6 w-full py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        🎙️ CAST TO FARCASTER
      </button>
    </div>
  );
};

export default ProfileCardCast;
