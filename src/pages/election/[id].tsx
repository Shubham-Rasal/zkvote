import React from "react";
import { ethers } from "ethers";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import VoteEvenOrOdd from "../../artifacts/contracts/circuits/VoteEvenOrOdd.sol/VoteEvenOrOdd.json";
import { useZokrates } from "../../contexts/ZokratesContext";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../../utils/converter";
import { getProvider, getVoteAddress } from "../../utils/web3";
import { useRouter } from "next/dist/client/router";

const TxMessage = ({ url }: { url: string }) => {
  return (
    <div className="mt-2">
      <p className="text-sm text-gray-600">Submitted!!</p>
    </div>
  );
};
interface HomeProps {
  proveKeyString: string;
  programString: string;
}

function ElectionPage({ proveKeyString, programString }: HomeProps) {
  const router = useRouter();
  const { id } = router.query;


  const [provider, setProvider] =
    useState<ethers.providers.JsonRpcProvider | null>(null);
  const [voteResult, setVoteResult] = useState<{ even: number; odd: number }>({
    even: 0,
    odd: 0,
  });
  const [amount, setAmount] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [voted, setVoted] = useState<boolean>(false);
  const zk = useZokrates();

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchVote() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const provider = getProvider();
      const contract = new ethers.Contract(
        getVoteAddress(),
        VoteEvenOrOdd.abi,
        provider
      );
      setProvider(provider);
      try {
        console.log("fetchVote", provider, contract);
        const even = await contract.votes(0);
        const odd = await contract.votes(1);
        setVoteResult({ even, odd });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  useEffect(() => {
    fetchVote();
  }, []);

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setAmount(e.target.value);
    } else {
      setAmount(null);
    }
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!zk) {
      console.log("ZK not ready");
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      setLoading(true);
      await requestAccount();
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        getVoteAddress(),
        VoteEvenOrOdd.abi,
        signer
      );
      try {
        console.log("ZK compile");
        // compilation
        const artifacts = zk.compile(programString);
        console.log("ZK artifacts");
        const { witness, output } = zk.computeWitness(artifacts, [amount]);
        console.log("ZK witness");
        // generate proof
        const proveKey = base64ToArrayBuffer(proveKeyString);
        console.log("ProveKey", proveKey.byteLength);
        const { proof, inputs } = zk.generateProof(
          artifacts.program,
          witness,
          proveKey
        );
        console.log("ZK proof", { proof });
        const transaction = await contract.vote(
          proof.a,
          proof.b,
          proof.c,
          inputs
        );
        const receipt = await transaction.wait();

        // setTxUrl(`https://ropsten.etherscan.io/tx/${receipt.transactionHash}`);
        fetchVote();

        setVoted(true);
        //set it in the local storage for this election
        localStorage.setItem(`election-${id}`, "true");

      } catch (e) {
        console.log("Error", e);
        setTxUrl(null);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex-auto">
      <Head>
        <title>ZKP Vote</title>
        <meta name="description" content="PoC of ZKP" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-6">
        <p className="text-4xl font-bold pb-8">Vote for your candidate</p>
        <form action="#" method="POST">
          <div className="shadow rounded-md overflow-hidden ">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md shadow-sm">
                    <img
                      src="/vercel.svg"
                      alt="Candidate A Logo"
                      className="w-16 h-16 mx-auto mb-4"
                    />
                    <p className="text-center text-lg font-bold">Candidate A</p>
                    <p className="text-center text-sm text-gray-600">
                      Vote for Even
                    </p>
                  </div>
                  <div className="p-4 border rounded-md shadow-sm">
                    <img
                      src="/vercel.svg"
                      alt="Candidate B Logo"
                      className="w-16 h-16 mx-auto mb-4"
                    />
                    <p className="text-center text-lg font-bold">Candidate B</p>
                    <p className="text-center text-sm text-gray-600">
                      Vote for Odd
                    </p>
                  </div>
                </div>
                <div className="block text-sm font-medium text-gray-700 pb-2">
                  {`Input even number(0,2,4...) or odd number(1,3,...) and vote!\n
                  Your voted number will not be logged on blockchain but the
                  vote result will be updated.`}
                </div>
                <div className="md:col-span-1">
                  <input
                    id="x"
                    name="x"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 my-2 block sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Input value 0 - 255"
                    inputMode="numeric"
                    onChange={handleChangeAmount}
                  />
                </div>

                {txUrl && <TxMessage url={txUrl} />}
                {loading && (
                  <div className="flex flex-row">
                    <p className="mt-2 text-sm text-gray-700">
                      Submitting your transaction. It may take 10 - 20 sec...
                    </p>
                    <img src="/spinner.svg" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={amount === null}
              >
                Vote
              </button>
            </div>
            <div className="p-4 bg-gray-50 sm:px-6 m-3 rounded-md">
              <p className="text-xl font-bold pb-8">Result</p>
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p className="text-gray-600 mb-2">Candidate A (Even)</p>
                  <p className="text-4xl font-bold">{voteResult.even}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Candidate B (Odd)</p>
                  <p className="text-4xl font-bold">{voteResult.odd}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
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

export default ElectionPage;

export async function getStaticPaths() {
  return {
    paths: [
      // String variant:
      "/election/1",
      "/election/2",
      "/election/3",
      "/election/4",
    ],
    fallback: true,
  };
}
