import React from "react";
import { ethers } from "ethers";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import VoteEvenOrOdd from "../artifacts/contracts/circuits/VoteEvenOrOdd.sol/VoteEvenOrOdd.json";
import { useZokrates } from "../contexts/ZokratesContext";
import { arrayBufferToBase64, base64ToArrayBuffer } from "../utils/converter";
import { getProvider, getVoteAddress } from "../utils/web3";

type Election = {
  id: string;
  name: string;
  votes: number;
  winner: string;
  date: string;
};

type Status = "Upcoming" | "Ongoing" | "Completed";

const elections: Election[] = [
  {
    id: "1",
    name: "2024 Presidential Election",
    votes: 150000000,
    winner: "John Doe",
    date: "2024-11-03",
  },
  {
    id: "2",
    name: "2024 Senate Race",
    votes: 80000000,
    winner: "Jane Smith",
    date: "2024-11-03",
  },
  {
    id: "3",
    name: "2023 Gubernatorial Election",
    votes: 5000000,
    winner: "Bob Johnson",
    date: "2023-11-07",
  },
];

const status = "Ongoing" as Status;



function Home() {
  const [ethereumAddress, setEthereumAddress] = useState(
    "0x0b89c86f69f560e865a529adda7e8ee269bf7fdd"
  );
  const [electionId, setElectionId] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkEligibility = () => {
    // This is where you would implement the actual eligibility check
    console.log(
      `Checking eligibility for address ${ethereumAddress} in election ${electionId}`
    );
    // For now, we'll just log the information
    setIsModalOpen(false);
  };
  return (
    <div className="flex-auto">
      <Head>
        <title>ZKP Vote</title>
        <meta name="description" content="PoC of ZKP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">
                    Voting Dashboard
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Check Eligibility
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => (
                <a
                  href={`/election/${election.id}`}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div
                    key={election.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {election.name}
                      </h3>
                      <div className="mt-5">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">
                            Votes:
                          </span>{" "}
                          {election.votes.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">
                            Winner:
                          </span>{" "}
                          {election.winner}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">
                            Date:
                          </span>{" "}
                          {election.date}
                        </p>

                        <p
                          className={`mt-2 text-sm font-medium ${
                            status === "Upcoming"
                              ? "text-blue-500"
                              : status === "Ongoing"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </main>

        {isModalOpen && (
          <div
            className="fixed z-10 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        Check Voting Eligibility
                      </h3>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Ethereum Address"
                          value={ethereumAddress}
                          onChange={(e) => setEthereumAddress(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Election ID"
                          value={electionId}
                          onChange={(e) => setElectionId(e.target.value)}
                          className="mt-4 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={checkEligibility}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const res = await fetch(
    "https://github.com/tomoima525/zkp-toy/raw/main/public/proving.key"
  );
  const arrayBuffer = await res.arrayBuffer();

  const proveKeyString = arrayBufferToBase64(arrayBuffer);

  const res2 = await fetch(
    "https://github.com/tomoima525/zkp-toy/raw/main/public/voteEvenOrOdd.zok"
  );

  const programString = await res2.text();

  return {
    props: {
      proveKeyString,
      programString,
    },
  };
};

export default Home;
