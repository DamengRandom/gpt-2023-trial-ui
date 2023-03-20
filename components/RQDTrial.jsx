import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { useMemo, useCallback, useState } from "react";

const queryClient = new QueryClient();

function RQDComponent() {
  const [query, setQuery] = useState();
  const queryMutation = useMutation({
    mutationFn: async (text) => {
      console.log("here? ", text);
      if (text) {
        const response = await fetch(`/api/gpt?words=${text}`); // query eg: "generate a javascript closure code example"

        if (!response.ok) throw new Error("not ok ..");

        const json = await response.json();

        return json?.data?.choices[0]?.text;
      } else {
        return "No request detected yet ..";
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answer"] });
    },
  });

  // using onChange to listen to the latest input then making APi request which is not a good option here ...
  const debounceRequest = useCallback(
    (value) => {
      queryMutation.mutate(value, {
        onSuccess: () => {
          setQuery("");
        },
      });
    },
    [queryMutation]
  );

  const handleRquest = useMemo(
    () =>
      debounce((value) => {
        debounceRequest(value);
      }, 5000),
    [debounceRequest]
  );

  const handleChange = useCallback(
    (event) => {
      setQuery(event.target.value);
      handleRquest(event.target.value);
    },
    [handleRquest]
  );

  return (
    <>
      <form>
        <label>Search query</label>
        <input name="query" value={query} onChange={handleChange} />
      </form>
      {queryMutation?.isLoading && <p>Content generating ..</p>}
      {queryMutation?.isError && (
        <p>Error occurred during generating new content ..</p>
      )}
      {queryMutation?.data && <p>{queryMutation.data}</p>}
    </>
  );
}

export default function RQD() {
  return (
    <QueryClientProvider client={queryClient}>
      <RQDComponent />
    </QueryClientProvider>
  );
}
