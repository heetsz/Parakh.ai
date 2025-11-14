import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

const NotFound = () => {
	const handleGoBack = () => {
		window.history.back();
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-black">
			{/* Glassmorphic Card */}
			<Card
				className="
          max-w-md w-full
          backdrop-blur-md
          bg-white/5
          border border-white/15
          shadow-none
        "
			>
				<CardHeader>
					<CardTitle className="text-center text-3xl font-semibold text-white">
						404 - Not Found
					</CardTitle>

					<CardDescription className="text-center mt-2 text-gray-400 leading-relaxed">
						"Not all those who wander are lost." <br /> — J.R.R. Tolkien
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center">
					<Button
						onClick={handleGoBack}
						className="
              font-medium
              bg-[#DFFF00]
              text-black
              hover:bg-[#c7e600]
              transition-colors
            "
					>
						Go Back
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default NotFound;
