"use client";

import { useRouter } from "next/router";

interface ErrorProps {
  statusCode?: number;
}

const Error = ({ statusCode }: ErrorProps) => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{statusCode || "Error"}</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Something went wrong.
        </p>
        <button
          onClick={() => router.reload()}
          className="text-primary underline hover:text-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
