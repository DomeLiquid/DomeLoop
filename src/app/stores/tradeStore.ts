import {
  AccountSummary,
  BalanceWithLendingPositionMap,
  BankMetadata,
  BankMetadataMap,
  DEFAULT_ACCOUNT_SUMMARY,
  ExtendedBankInfo,
  makeExtendedBankInfo,
  TokenDataMap,
  TokenWithPriceMetadata,
  TokenWithPriceMetadataMap,
} from '@/lib/mrgnlend';
import {
  AssetWithPrice,
  Bank,
  BankWithState,
  Account,
} from '@/types/account';
import { create, StateCreator } from 'zustand';
import Fuse, { FuseResult } from 'fuse.js';
import {
  getAccounts,
  getDomeAssets,
  getDomeBanks,
  getGroupAssetsWithPrice,
  listBalances,
  getTradeGroupsMap,
  listBanks,
  accountSummary,
  getDomeTokenData,
  getGroupAccounts,
  getUserAssetsInfo,
} from '@/lib/actions';
import { TokenData } from '@/types/type';
import { getGroupPositionInfo } from '@/lib/tradeUtils';

export type TradeGroupsCache = {
  [group: string]: [string, string];
};

export enum TradePoolFilterStates {
  TIMESTAMP = 'timestamp',
  PRICE_MOVEMENT_ASC = 'price-movement-asc',
  PRICE_MOVEMENT_DESC = 'price-movement-desc',
  MARKET_CAP_ASC = 'market-cap-asc',
  MARKET_CAP_DESC = 'market-cap-desc',
  LIQUIDITY_ASC = 'liquidity-asc',
  LIQUIDITY_DESC = 'liquidity-desc',
  APY_ASC = 'apy-asc',
  APY_DESC = 'apy-desc',
}
export const POOLS_PER_PAGE = 12;

export type DomeBank = ExtendedBankInfo & {
  tokenData?: {
    // 当前价格
    price: number;
    // 24小时价格变化百分比
    priceChange24hr: number;
    // 24小时交易量
    volume24hr: number;
    // 24小时交易量变化百分比
    volumeChange24hr: number;
    // 市值
    marketCap: number;
  };
};

export type DomePool = {
  token: DomeBank;
  quoteTokens: DomeBank[]; // will just be single USDC bank for now, but this allows us to add quote tokens in future
  // just total liquidity for now, this could be other stats we get from goncarlo api
  poolData?: {
    totalLiquidity: number;
  };
};

export type GroupData = {
  groupId: string;
  pool: DomePool;
  accounts: Account[];
  selectedAccount: Account | null;
  accountSummary: AccountSummary;
};

type Portfolio = {
  long: GroupData[];
  short: GroupData[];
  lpPositions: GroupData[];
} | null;

type TradeStoreState = {
  // keep track of store state
  initialized: boolean;
  connected: boolean;

  assetAmountMap: Map<string, number>;

  userDataFetched: boolean;
  isRefreshingStore: boolean;

  groupsCache: TradeGroupsCache;

  groupMap: Map<string, GroupData>;

  bankMetadataCache: BankMetadataMap;
  tokenMetadataCache: TokenDataMap;

  // array of banks filtered by search query
  searchResults: FuseResult<GroupData>[];

  // pagination and sorting
  currentPage: number;
  totalPages: number;
  sortBy: TradePoolFilterStates;

  // user data
  portfolio: Portfolio | null;
  referralCode: string | null;

  /* Actions */
  // fetch groups / banks
  fetchTradeState: ({ refresh }: { refresh?: boolean }) => Promise<void>;
  refreshGroup: ({ groupId }: { groupId: string }) => Promise<void>;
  setIsRefreshingStore: (isRefreshing: boolean) => void;
  searchBanks: (searchQuery: string) => void;
  resetSearchResults: () => void;
  setCurrentPage: (page: number) => void;
  setSortBy: (sortBy: TradePoolFilterStates) => void;
  setConnected: (connected: boolean) => void;
};

export const USDC_SOL_ASSET_ID: string = 'de6fa523-c596-398e-b12f-6d6980544b59';

let fuse: Fuse<GroupData> | null = null;

function createTradeStore() {
  return create<TradeStoreState>(stateCreator);
}

const stateCreator: StateCreator<TradeStoreState, [], []> = (set, get) => ({
  initialized: false,
  connected: false,
  assetAmountMap: new Map<string, number>(),
  userDataFetched: false,
  isRefreshingStore: false,

  groupsCache: {},

  tokenMetadataCache: {},
  bankMetadataCache: {},
  groupMap: new Map<string, GroupData>(),
  searchResults: [],
  currentPage: 1,
  totalPages: 0,
  sortBy: TradePoolFilterStates.PRICE_MOVEMENT_DESC,
  activeGroup: null,
  nativeSolBalance: 0,
  accountsMap: new Map<string, Account[]>(),
  tokenAccountMap: null,
  connection: null,
  wallet: null,
  portfolio: null,
  referralCode: null,

  setIsRefreshingStore: (isRefreshing) => {
    set((state) => {
      return {
        ...state,
        isRefreshingStore: isRefreshing,
      };
    });
  },

  fetchTradeState: async (args) => {
    try {
      let { groupsCache, assetAmountMap } = get();

      if (!Object.keys(groupsCache).length) {
        let tradeGroupsCache = await getTradeGroupsMap();
        set({ groupsCache: tradeGroupsCache ?? {} });
      }

      groupsCache = get().groupsCache;

      const groups = Object.keys(groupsCache).map((group) => group);
      const groupMap = get().groupMap;
      // const allBanks: ExtendedBankInfo[] = [];

      let bankMetadataMap: BankMetadataMap = {};
      let tokenMetadataMap: TokenDataMap = {};
      let userDataFetched = false;

      try {
        const assetsWithPrice = await getDomeAssets();
        if (assetsWithPrice && assetsWithPrice.length > 0) {
          tokenMetadataMap = assetsWithPrice.reduce(
            (acc: TokenDataMap, asset: TokenData) => {
              acc[asset.assetId] = {
                price: asset.price,
                priceHighest: asset.priceHighest,
                priceLowest: asset.priceLowest,
                assetId: asset.assetId,
                chainId: asset.chainId,
                symbol: asset.symbol,
                name: asset.name,
                iconUrl: asset.iconUrl,
                chain: asset.chain,
                priceChange24h: asset.priceChange24h,
                volume24hr: asset.volume24hr,
                // volumeChange24h: asset.volumeChange24h,
                // volume4h: asset.volume4h,
                // volumeChange4h: asset.volumeChange4h,
                marketcap: asset.marketcap,
              };
              return acc;
            },
            {},
          );
        }
      } catch (error) {
        console.error(error);
      }

      let banksWithState: BankWithState[] | null = [];
      try {
        banksWithState = await getDomeBanks();
        if (banksWithState) {
          bankMetadataMap = banksWithState.reduce(
            (acc: BankMetadataMap, bank) => {
              acc[bank.id] = {
                id: bank.id,
                mixinAssetId: bank.mixinSafeAssetId,
              };
              return acc;
            },
            {},
          );
        }
      } catch (error) {
        console.error('Error fetching banks', error);
      }

      const banksWithPriceAndToken: {
        bankWithState: BankWithState;
        tokenWithPriceMetadata: TokenWithPriceMetadata;
      }[] = [];
      if (banksWithState) {
        banksWithState.forEach((bankWithState) => {
          const bankMetadata = bankMetadataMap[bankWithState.id];
          if (bankMetadata) {
            const tokenWithPriceMetadata =
              tokenMetadataMap[bankMetadata.mixinAssetId];

            if (tokenWithPriceMetadata) {
              banksWithPriceAndToken.push({
                bankWithState,
                tokenWithPriceMetadata,
              });
            }
          }
        });
      }

      if (!assetAmountMap || assetAmountMap.size === 0) {
        const assetIds = banksWithPriceAndToken.map(
          (bank) => bank.tokenWithPriceMetadata.assetId,
        );
        const userAssetsInfo = await getUserAssetsInfo(assetIds);
        if (userAssetsInfo) {
          userAssetsInfo.forEach((asset) => {
            assetAmountMap.set(asset.assetId, asset.amount);
          });
          set({ assetAmountMap });
        }
      }
      assetAmountMap = get().assetAmountMap;

      await Promise.all(
        groups.map(async (groupId) => {
          const { groupData, extendedBankInfos } = await getGroupData({
            groupId: groupId,
            banksWithPriceAndToken,
            assetAmountMap,
            // balancesWithLendingPositionMap,
            tokenMetadataMap,
          });

          // allBanks.push(...extendedBankInfos);

          groupMap.set(groupId, groupData);
        }),
      );

      fuse = new Fuse(Array.from(get().groupMap.values()), {
        includeScore: true,
        threshold: 0.2,
        keys: [
          {
            name: 'pool.token.meta.tokenSymbol',
            weight: 0.7,
          },
          {
            name: 'pool.token.meta.tokenName',
            weight: 0.3,
          },
          {
            name: 'pool.token.info.state.mint.toBase58()',
            weight: 0.1,
          },
        ],
      });
      let portfolio: Portfolio | null = null;

      portfolio = getPorfolioData(get().groupMap);
      const sortedGroups = sortGroups(groupMap, get().sortBy, groupsCache);
      const totalPages = Math.ceil(groupMap.entries.length / POOLS_PER_PAGE);
      const currentPage = get().currentPage || 1;

      set({
        initialized: true,
        groupsCache: groupsCache,
        groupMap: sortedGroups,
        totalPages,
        currentPage,
        userDataFetched: userDataFetched,
        portfolio: portfolio,
        bankMetadataCache: bankMetadataMap,
        tokenMetadataCache: tokenMetadataMap,
      });
    } catch (error) {
      console.error(error);
    }
  },

  refreshGroup: async (args: { groupId: string }) => {
    try {
      const activeGroup = args.groupId;

      const groupMap = get().groupMap;
      const connected = get().connected;
      if (!activeGroup) throw new Error('No group to refresh');
      if (!groupMap) throw new Error('Groups not fetched');
      if (!connected) throw new Error('Wallet not connected');

      let bankMetadataMap: BankMetadataMap = {};
      let tokenMetadataMap: TokenDataMap = {};

      try {
        const assetsWithPrice = await getDomeAssets();
        if (assetsWithPrice && assetsWithPrice.length > 0) {
          tokenMetadataMap = assetsWithPrice.reduce(
            (acc: TokenDataMap, asset: TokenData) => {
              acc[asset.assetId] = {
                price: asset.price,
                priceHighest: asset.priceHighest,
                priceLowest: asset.priceLowest,
                assetId: asset.assetId,
                chainId: asset.chainId,
                symbol: asset.symbol,
                name: asset.name,
                iconUrl: asset.iconUrl,
                chain: asset.chain,
                priceChange24h: asset.priceChange24h,
                volume24hr: asset.volume24hr,
                // volumeChange24h: asset.volumeChange24h,
                // volume4h: asset.volume4h,
                // volumeChange4h: asset.volumeChange4h,
                marketcap: asset.marketcap,
              };
              return acc;
            },
            {},
          );
        }
      } catch (error) {
        console.error(error);
      }

      let banksWithState: BankWithState[] | null = [];
      try {
        banksWithState = await getDomeBanks();
        if (banksWithState) {
          bankMetadataMap = banksWithState.reduce(
            (acc: BankMetadataMap, bank) => {
              acc[bank.id] = {
                id: bank.id,
                mixinAssetId: bank.mixinSafeAssetId,
              };
              return acc;
            },
            {},
          );
        }
      } catch (error) {
        console.error('Error fetching banks', error);
      }

      const banksWithPriceAndToken: {
        bankWithState: BankWithState;
        tokenWithPriceMetadata: TokenWithPriceMetadata;
      }[] = [];
      if (banksWithState) {
        banksWithState.forEach((bankWithState) => {
          const bankMetadata = bankMetadataMap[bankWithState.id];
          if (bankMetadata) {
            const tokenWithPriceMetadata =
              tokenMetadataMap[bankMetadata.mixinAssetId];

            if (tokenWithPriceMetadata) {
              banksWithPriceAndToken.push({
                bankWithState,
                tokenWithPriceMetadata,
              });
            }
          }
        });
      }

      const { groupData, extendedBankInfos } = await getGroupData({
        groupId: activeGroup,
        banksWithPriceAndToken,
        assetAmountMap: get().assetAmountMap,
        tokenMetadataMap,
      });

      let portfolio: Portfolio | null = null;
      groupMap.set(activeGroup, groupData);
      portfolio = getPorfolioData(groupMap);

      set({
        portfolio,
        groupMap,
        bankMetadataCache: bankMetadataMap,
        tokenMetadataCache: tokenMetadataMap,
      });
    } catch (error) {
      console.error(error);
    }
  },
  searchBanks: (searchQuery: string) => {
    const state = get();
    if (!state.initialized || !fuse) {
      set({ searchResults: [] });
      return;
    }

    try {
      const searchResults = fuse.search(searchQuery) ?? [];
      set({ searchResults });
    } catch (error) {
      console.error('Search error:', error);
      set({ searchResults: [] });
    }
  },

  resetSearchResults: () => {
    set((state) => {
      return {
        ...state,
        searchResults: [],
      };
    });
  },

  setCurrentPage: (page: number) => {
    set((state) => {
      return {
        ...state,
        currentPage: page,
      };
    });
  },

  setSortBy: (sortBy: TradePoolFilterStates) => {
    const groupMap = sortGroups(get().groupMap, sortBy, get().groupsCache);
    set((state) => {
      return {
        ...state,
        sortBy,
        groupMap,
      };
    });
  },
  setConnected: (connected: boolean) => {
    set((state) => {
      return {
        ...state,
        connected,
      };
    });
  },
});

const sortGroups = (
  groupMap: Map<string, GroupData>,
  sortBy: TradePoolFilterStates,
  groupsCache: TradeGroupsCache,
) => {
  const groups = Array.from(groupMap.values());
  const timestampOrder = Object.keys(groupsCache).reverse();

  const sortedGroups = groups.sort((a, b) => {
    if (sortBy === TradePoolFilterStates.TIMESTAMP) {
      const aIndex = timestampOrder.indexOf(a.groupId);
      const bIndex = timestampOrder.indexOf(b.groupId);
      return aIndex - bIndex;
    } else if (sortBy.startsWith('price-movement')) {
      const aPrice = Math.abs(a.pool.token.tokenData?.priceChange24hr ?? 0);
      const bPrice = Math.abs(b.pool.token.tokenData?.priceChange24hr ?? 0);
      return sortBy === TradePoolFilterStates.PRICE_MOVEMENT_ASC
        ? aPrice - bPrice
        : bPrice - aPrice;
    } else if (sortBy.startsWith('market-cap')) {
      const aMarketCap = a.pool.token.tokenData?.marketCap ?? 0;
      const bMarketCap = b.pool.token.tokenData?.marketCap ?? 0;
      return sortBy === TradePoolFilterStates.MARKET_CAP_ASC
        ? aMarketCap - bMarketCap
        : bMarketCap - aMarketCap;
    } else if (sortBy.startsWith('liquidity')) {
      const aLiquidity = a.pool.poolData?.totalLiquidity ?? 0;
      const bLiquidity = b.pool.poolData?.totalLiquidity ?? 0;
      return sortBy === TradePoolFilterStates.LIQUIDITY_ASC
        ? aLiquidity - bLiquidity
        : bLiquidity - aLiquidity;
    } else if (sortBy.startsWith('apy')) {
      const getHighestLendingRate = (group: GroupData) => {
        const rates = [
          group.pool.token.info.state.lendingRate,
          ...group.pool.quoteTokens.map((bank) => bank.info.state.lendingRate),
        ];
        return Math.max(...rates);
      };

      const aHighestRate = getHighestLendingRate(a);
      const bHighestRate = getHighestLendingRate(b);
      return sortBy === TradePoolFilterStates.APY_ASC
        ? aHighestRate - bHighestRate
        : bHighestRate - aHighestRate;
    }

    return 0;
  });

  const sortedGroupMap = new Map<string, GroupData>();

  sortedGroups.forEach((group) => {
    sortedGroupMap.set(group.groupId, group);
  });

  return sortedGroupMap;
};

async function getGroupData({
  groupId,
  banksWithPriceAndToken,
  assetAmountMap,
  // balancesWithLendingPositionMap,
  tokenMetadataMap,
}: {
  groupId: string;
  banksWithPriceAndToken: {
    bankWithState: BankWithState;
    tokenWithPriceMetadata: TokenWithPriceMetadata;
  }[];
  assetAmountMap: Map<string, number>;
  // balancesWithLendingPositionMap,
  tokenMetadataMap: TokenDataMap;
}) {
  let groupData: GroupData = {
    groupId,
    pool: {} as any,
    accounts: [],
    selectedAccount: null,
    accountSummary: DEFAULT_ACCOUNT_SUMMARY,
  };

  let balancesWithLendingPositionMap: BalanceWithLendingPositionMap = {};
  const accounts = await getGroupAccounts(groupId);
  if (accounts) {
    groupData.accounts = accounts;
    if (accounts.length > 0) {
      groupData.selectedAccount = accounts[0];
    }

    if (groupData.selectedAccount) {
      try {
        const [accountSummaryResult, balancesWithLendingPosition] =
          await Promise.all([
            accountSummary(groupData.selectedAccount.id),
            listBalances(groupData.selectedAccount.id),
          ]);

        groupData.accountSummary =
          accountSummaryResult || DEFAULT_ACCOUNT_SUMMARY;

        if (
          balancesWithLendingPosition &&
          Array.isArray(balancesWithLendingPosition)
        ) {
          balancesWithLendingPositionMap = balancesWithLendingPosition.reduce(
            (acc, balance) => {
              if (balance && balance.balanceAmount.bankId) {
                acc[balance.balanceAmount.bankId] = {
                  ...balance.balanceAmount,
                  position: balance.position,
                };
              }
              return acc;
            },
            {} as BalanceWithLendingPositionMap,
          );
        }
      } catch (error) {
        console.error('Error fetching account data', error);
      }
    }
  }

  banksWithPriceAndToken = banksWithPriceAndToken.filter(
    (bank) => bank.bankWithState.groupId === groupId,
  );

  const extendedBankInfos = await Promise.all(
    banksWithPriceAndToken.map(async (bankWithPriceAndToken) => {
      const extendedBankInfo = makeExtendedBankInfo(
        bankWithPriceAndToken.bankWithState,
        bankWithPriceAndToken.tokenWithPriceMetadata,
        balancesWithLendingPositionMap[bankWithPriceAndToken.bankWithState.id],
        tokenMetadataMap[
          bankWithPriceAndToken.bankWithState.emissionsMixinSafeAssetId || ''
        ],
        assetAmountMap,
      );

      const tokenMetadata =
        tokenMetadataMap[bankWithPriceAndToken.bankWithState.mixinSafeAssetId];
      const extendedArenaBank = {
        ...extendedBankInfo,
        tokenData: {
          price: bankWithPriceAndToken.tokenWithPriceMetadata.price,
          priceChange24hr: tokenMetadata?.priceChange24h || 0,
          volume24hr: tokenMetadata?.volume24hr || 0,
          // volumeChange24hr: tokenMetadata?.volumeChange24h || 0,
          marketCap: tokenMetadata?.marketcap || 0,
        },
      } as DomeBank;

      return extendedArenaBank;
    }),
  );

  // change this logic when adding more collateral banks
  const tokenBanks = extendedBankInfos.filter(
    (bank) => bank.info.mixinSafeAssetId !== USDC_SOL_ASSET_ID,
  );
  const collateralBanks = extendedBankInfos.filter(
    (bank) => bank.info.mixinSafeAssetId === USDC_SOL_ASSET_ID,
  );

  const totalTokenLiquidity = tokenBanks.reduce(
    (total, bank) =>
      total + bank.info.state.totalDeposits * (bank.tokenData?.price || 0),
    0,
  );

  const totalCollateralLiquidity = collateralBanks.reduce(
    (total, bank) =>
      total + bank.info.state.totalDeposits * (bank.tokenData?.price || 0),
    0,
  );

  groupData.pool = {
    token: tokenBanks[0],
    quoteTokens: collateralBanks,
    poolData: {
      totalLiquidity: totalTokenLiquidity + totalCollateralLiquidity,
    },
  };

  return { groupData, extendedBankInfos };
}

function getPorfolioData(groupMap: Map<string, GroupData>) {
  const longPositions: GroupData[] = [];
  const shortPositions: GroupData[] = [];
  const lpPositions: GroupData[] = [];

  let portfolio: Portfolio | null = null;

  groupMap.forEach((group) => {
    const positionInfo = getGroupPositionInfo({ group });
    if (positionInfo === 'LP') {
      lpPositions.push(group);
    } else if (positionInfo === 'LONG') {
      longPositions.push(group);
    } else if (positionInfo === 'SHORT') {
      shortPositions.push(group);
    }
  });

  // Sort groups by USD value
  const sortGroupsByValue = (groups: GroupData[]) => {
    return groups.sort((a, b) => {
      const aValue =
        a.pool.token.isActive && a.pool.token.balanceWithLendingPosition
          ? a.pool.token.balanceWithLendingPosition.position?.usdValue
          : 0;
      const bValue =
        b.pool.token.isActive && b.pool.token.balanceWithLendingPosition
          ? b.pool.token.balanceWithLendingPosition.position?.usdValue
          : 0;
      return (bValue || 0) - (aValue || 0);
    });
  };

  // Create portfolio if there are any positions
  if (
    longPositions.length > 0 ||
    shortPositions.length > 0 ||
    lpPositions.length > 0
  ) {
    portfolio = {
      long: sortGroupsByValue(longPositions),
      short: sortGroupsByValue(shortPositions),
      lpPositions: sortGroupsByValue(lpPositions),
    };
  }

  return portfolio;
}

export { createTradeStore };
export type { TradeStoreState };
