import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Code,
  MessageSquare,
  BookOpen,
  Briefcase,
  Gift,
  Coins,
  Lock,
  ExternalLink,
  Target,
  Rocket,
} from "lucide-react";

export default function Gamification() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [user, setUser] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${base_url}/me`, { withCredentials: true });
      setUser(res.data);
      setError(null);
    } catch (err) {
      setError("Please log in to access gamification features.");
      setUser(null);
    }
  };

  const loadStoreItems = () => {
  setStoreItems([
    {
       _id: "690f7b42e7fe6a8bffcb9588",
      name: "Exclusive Hoodie",
      description: "Premium hoodie for top achievers",
      cost: 500,
      image: "/assets/hoodie.png",
    },
    {
     _id: "690f7b4be7fe6a8bffcb958a",
      name: "Branded Mug",
      description: "Start your day with a coding mug",
      cost: 250,
      image: "/assets/mug.png",
    },
    {
      _id: "690f7b55e7fe6a8bffcb958c",
      name: "Laptop Sleeve",
      description: "Protect your laptop in style",
      cost: 400,
      image: "/assets/sleeve.avif",
    },
    {
       _id: "690f7b5ee7fe6a8bffcb958e",
      name: "Cool Cap",
      description: "Show your coder pride with this cap",
      cost: 300,
      image: "/assets/cap.jpg",
    },
  ]);
};

  useEffect(() => {
    fetchProfile();
    loadStoreItems();
    const interval = setInterval(fetchProfile, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLeetCodeDaily = async () => {
    window.open("https://leetcode.com/problemset/", "_blank");
    try {
      await axios.post(
        `${base_url}/gamification/add-coins`,
        { type: "coding" },
        { withCredentials: true }
      );
      fetchProfile();
    } catch (error) {
      console.error("Error adding coins:", error);
    }
  };

  const handleInterviewPractice = async () => {
    navigate("/dashboard/interviews");
    try {
      await axios.post(
        `${base_url}/gamification/add-coins`,
        { type: "interview" },
        { withCredentials: true }
      );
      fetchProfile();
    } catch (error) {
      console.error("Error adding interview coins:", error);
    }
  };

  const handleReadArticles = () => {
    window.open("https://www.geeksforgeeks.org ", "_blank");
  };

  const handleTalkToExpert = () => {
     window.open("https://mentorcruise.com/", "_blank");
  };

  const handleContest = async () => {
    window.open("https://leetcode.com/contest/", "_blank");
    try {
      await axios.post(
        `${base_url}/gamification/add-coins`,
        { type: "contest" },
        { withCredentials: true }
      );
      fetchProfile();
    } catch (error) {
      console.error("Error adding contest coins:", error);
    }
  };

  const handleRedeem = async (item) => {
    if (!user) return;
    try {
      const res = await axios.post(
        `${base_url}/gamification/redeem`,
        { itemId: item._id },
        { withCredentials: true }
      );
      setUser({ ...user, coins: res.data.coins });
      alert(`🎉 Successfully redeemed ${item.name}!`);
    } catch (error) {
      console.error("Error redeeming item:", error);
      alert("Failed to redeem item.");
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <p className="text-gray-600">{error}</p>
          ) : (
            <>
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your progress...</p>
            </>
          )}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600">
                Level up your skills — earn, learn, and grow!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl shadow-lg">
              <Coins className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Your Balance</p>
                <p className="text-2xl font-bold">{user.coins}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earn Coins Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-black">Earn Coins</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1️⃣ Daily Coding */}
          <Card className="border border-black shadow-md hover:shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">
                  Daily Coding
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Solve LeetCode problems and earn 10–30 coins.
                </p>
              </div>
              <Button
                onClick={handleLeetCodeDaily}
                className="bg-black text-white hover:bg-gray-800 h-10 text-sm"
              >
                Solve Now
              </Button>
            </CardContent>
          </Card>

          {/* 2️⃣ Mock Interviews */}
          <Card className="border border-black shadow-md hover:shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">
                  Mock Interviews
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Practice with AI Interviewer & earn 50 coins.
                </p>
              </div>
              <Button
                onClick={handleInterviewPractice}
                className="bg-black text-white hover:bg-gray-800 h-10 text-sm"
              >
                Start Interview
              </Button>
            </CardContent>
          </Card>

          {/* 3️⃣ Read Articles */}
          <Card className="border border-black shadow-md hover:shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">
                  Read Articles
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn from coding articles & improve your skills.
                </p>
              </div>
              <Button
                onClick={handleReadArticles}
                className="bg-black text-white hover:bg-gray-800 h-10 text-sm"
              >
                Read Now
              </Button>
            </CardContent>
          </Card>

          {/* 4️⃣ Talk to Expert */}
          <Card className="border border-black shadow-md hover:shadow-xl transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">
                  Talk with Expert
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get insights & motivation from industry mentors.
                </p>
              </div>
              <Button
                onClick={handleTalkToExpert}
                className="bg-black text-white hover:bg-gray-800 h-10 text-sm"
              >
                Connect
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 🚀 Contest Section */}
        <div className="mt-10">
          <Card className="border-2 border-black shadow-lg bg-gradient-to-r from-gray-50 to-white">
            <CardContent className="p-8 text-center">
              <Rocket className="w-10 h-10 mx-auto mb-3 text-black" />
              <h2 className="text-2xl font-bold mb-2 text-black">
                Join Coding Contest
              </h2>
              <p className="text-gray-600 mb-4">
                Compete with others, climb the leaderboard, and earn 100+ coins!
              </p>
              <Button
                onClick={handleContest}
                className="bg-black text-white hover:bg-gray-800 h-11 text-base"
              >
                Go to Contests
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 🛍 Rewards Store */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-black">Rewards Store</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeItems.map((item) => {
              const canAfford = user.coins >= item.cost;
              return (
                <Card
                  key={item._id}
                  className={`border-2 shadow-lg ${canAfford
                      ? "border-black hover:shadow-xl"
                      : "border-gray-300 opacity-75"
                    }`}
                >
                  <CardContent className="p-5 text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 h-28 object-contain mx-auto mb-3 rounded-xl"
                    />
                    <h3 className="font-bold text-lg text-black mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {item.description}
                    </p>
                    <div className="flex justify-center items-center gap-2 mb-3">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-black">
                        {item.cost}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford}
                      className={`w-full h-10 font-semibold ${canAfford
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      {canAfford ? "Redeem" : `Need ${item.cost - user.coins}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
