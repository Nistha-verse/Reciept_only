// No source in mutation variables/cache and no automatic retry of a possibly broadcast post.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk, ReceiptsError } from "@/lib/sdk";
import { useWizard } from "@/store/wizard";
export function useSubmitReview() {
  const query = useQueryClient();
  return useMutation({
    mutationKey: ["post-review"],
    retry: false,
    gcTime: 0,
    mutationFn: async () => {
      const draft = useWizard.getState();
      if (!draft.source || !draft.receipt)
        throw new ReceiptsError("INVALID_INPUT");
      return sdk.post(draft.source, draft.rating, draft.text, draft.demo);
    },
    onSuccess: (result) => {
      const state = useWizard.getState();
      if (state.step === 3) state.dispatch({ type: "SUCCESS", result });
      else state.dispatch({ type: "RESET" });
      void query.invalidateQueries({ queryKey: ["reviews"] });
      void query.invalidateQueries({ queryKey: ["merchants"] });
      void query.invalidateQueries({ queryKey: ["health"] });
    },
  });
}
