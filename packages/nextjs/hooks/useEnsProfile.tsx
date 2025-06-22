// hooks/useEnsProfile.ts
import { useEffect, useState } from "react";
import { getDefaultProvider } from "ethers";
import blockies from "ethereum-blockies-base64";

type ProfileResult = {
  name: string | null;
  avatar: string;
  loading: boolean;
};

export function useEnsProfile(address: string): ProfileResult {
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `ensProfile:${address.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      setName(parsed.name);
      setAvatar(parsed.avatar);
      setLoading(false);
      return;
    }

    const provider = getDefaultProvider();

    async function fetchProfile() {
      setLoading(true);
      try {
        const resolvedName = await provider.lookupAddress(address);
        let avatarUrl = "";

        if (resolvedName) {
          const resolver = await provider.getResolver(resolvedName);
          const avatar = resolver ? await resolver.getText("avatar") : null;
          if (avatar) {
            avatarUrl = avatar;
          }
        }

        if (!avatarUrl) {
          avatarUrl = blockies(address);
        }

        setName(resolvedName);
        setAvatar(avatarUrl);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ name: resolvedName, avatar: avatarUrl })
        );
      } catch (error) {
        console.error("ENS resolution failed:", error);
        setAvatar(blockies(address));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [address]);

  return { name, avatar, loading };
}
