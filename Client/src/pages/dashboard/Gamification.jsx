import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Code,
  MessageSquare,
  Gift,
  Coins,
  Star,
  Lock,
  ExternalLink,
  Award,
  Target,
} from "lucide-react";

export default function Gamification() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [user, setUser] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch user profile
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

  // ✅ Load store items (can later come from DB)
  const loadStoreItems = () => {
    setStoreItems([
      { _id: "1", name: "Premium Badge", description: "Exclusive gold badge for your profile", cost: 100, icon: "🏆" },
      { _id: "2", name: "Code Master Medal", description: "Show your coding expertise", cost: 150, icon: "💻" },
      { _id: "3", name: "Interview Pro", description: "Elite interviewer status", cost: 200, icon: "🎯" },
      { _id: "4", name: "Dark Theme", description: "Unlock premium dark theme", cost: 80, icon: "🌙" },
      { _id: "5", name: "Custom Avatar", description: "Personalize your profile picture", cost: 120, icon: "🎨" },
      { _id: "6", name: "Speed Boost", description: "2x coin earning for 7 days", cost: 300, icon: "⚡" },
    ]);
  };

  useEffect(() => {
    fetchProfile();
    loadStoreItems();

    // Recheck user session every hour
    const interval = setInterval(fetchProfile, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Add coins when solving coding problems
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

  // ✅ Redirect to Interview Page and add coins after completion
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

  // ✅ Redeem reward
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
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your progress...</p>
            </>
          )}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-gray-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600">
                Keep learning, earning, and achieving your goals
              </p>
            </div>
            <div className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl shadow-lg">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Your Balance</p>
                <p className="text-3xl font-bold">{user.coins}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Earn Coins Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-black">Earn Coins</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* LeetCode Challenge */}
            <Card className="border-2 border-black shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    +10–30 coins
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Daily Coding Challenge
                </h3>
                <p className="text-gray-600 mb-6">
                  Solve LeetCode problems and earn coins based on difficulty
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Easy: 10 coins
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Medium: 20 coins
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-red-500" />
                    Hard: 30 coins
                  </li>
                </ul>
                <Button
                  className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-semibold"
                  onClick={handleLeetCodeDaily}
                >
                  Start Solving
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Mock Interview */}
            <Card className="border-2 border-black shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    +50 coins
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-black">
                  Mock Interview
                </h3>
                <p className="text-gray-600 mb-6">
                  Practice with AI interviewer and boost your preparation
                </p>

                <Button
                  className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base font-semibold"
                  onClick={handleInterviewPractice}
                >
                  Start Interview
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-black">Your Achievements</h2>
          </div>
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-6">
              {user.achievements && user.achievements.length ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {user.achievements.map((ach) => (
                    <div
                      key={ach._id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-1">
                          {ach.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No achievements yet. Start earning today!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Redeem Store */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Gift className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-black">Rewards Store</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {storeItems.map((item) => {
              const canAfford = user.coins >= item.cost;
              return (
                <Card
                  key={item._id}
                  className={`border-2 shadow-lg transition-all ${canAfford
                      ? "border-black bg-white hover:shadow-xl"
                      : "border-gray-300 bg-gray-50 opacity-75"
                    }`}
                >
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div
                        className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 ${canAfford ? "bg-black" : "bg-gray-300"
                          }`}
                      >
                        <span>{item.icon}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-black">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4 text-lg font-bold">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-black">{item.cost}</span>
                    </div>

                    <Button
                      className={`w-full h-11 font-semibold ${canAfford
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      disabled={!canAfford}
                      onClick={() => handleRedeem(item)}
                    >
                      {canAfford ? (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Redeem Now
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Need {item.cost - user.coins} more coins
                        </>
                      )}
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
