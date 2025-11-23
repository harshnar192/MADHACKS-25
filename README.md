# Pulse - Your Financial Heartbeat, Decoded

## Introduction
Pulse is a smart personal finance assistant that not only analyzes what you spend, but also why you spend. Instead of treating every transaction as a number, Pulse captures the context behind your financial decisions—whether it’s stress shopping, celebration spending, routine necessities, or long-term planning.

By understanding both behavior and motivation, Pulse transforms raw financial data into meaningful, personalized guidance, helping users build healthier and more sustainable financial habits.

## Motivation
Traditional & modern budgeting apps fall short in two ways: (1) **Transactional** - focusing on "how much" is spent but not "why" it is spent; (2) **Generic Advice** - everyone has the same common bugeting rules. 

However, spending is often emotional. College students may eat out frequently due to academic stress, or reward themselves with a Starbucks drink after an achievement. Without acknowledging these factors, budgeting can feel restrictive, guilt-driven, and ultimately unsustainable.

Additionally, young users prefer talking over manually recording expenses. To support this behavior, Pulse allows users to speak their spending decisions aloud. The assistant transcribes the input, detects emotional tone, and tracks the reasoning behind each purchase. Moreover, the assistant can give the users weekly summaries, acting as either a supportive friend, a stern coach, or any personality figure of their ideal assistants. 

Pulse's goal is simple: **Help users understand the heartbeat behind their finances, not just the numbers.**

## Tech Stack Overview
##### Backend
*   **NodeJS Server**: The server receives users' audio speech, store transactions data in localStorage, and orchestrating the speech/text processing pipeline. 
*   **Claude API**: Generate the summary based on the processed transactions data and the user financial goals. 
*   **Fish Audio**: Processing text-to-speech scripts and speech-to-text audios. 
##### Frontend
*   **React + Vite**: A simple beautiful frontend

## How To Run

First, create an .env file that contains the following: 
```
# .env
ANTHROPIC_API_KEY="YOUR API KEY"

PORT=3001
VITE_API_URL=http://localhost:3001
FISH_API_KEY="YOUR API KEY"

MONGODB_URI="YOUR URL"

```


Then, open two terminals to run the frontend and the backend

```{bash}
# ./MADHACKS-25/madproject
# Frontend
pnpm install
pnpm run dev
# Should be localhost:5173
```

```{bash}
# ./MADHACKS-25
# Backend
npm install
npm start
```

Then access the website through localhost:5173
