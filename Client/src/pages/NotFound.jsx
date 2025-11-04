import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const NotFound = () => {
	const handleGoBack = () => {
		window.history.back();
	};

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="max-w-md w-full">
				<CardHeader>
					<CardTitle className="text-center text-3xl font-bold">404 - Not Found</CardTitle>
					<CardDescription className="text-center mt-2">
						"Not all those who wander are lost." <br />— J.R.R. Tolkien
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center">
					<Button onClick={handleGoBack} variant="outline">
						Go Back
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default NotFound;