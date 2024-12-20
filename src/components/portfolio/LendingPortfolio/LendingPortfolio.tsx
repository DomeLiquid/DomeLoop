// import { useUiStore, useMrgnlendStore } from '@/app/stores';
// import { Link, useRouter } from '@/navigation';
// import React from 'react';
// import { PortfolioUserStats } from '../PortfolioUserStats';
// import { ActiveBankInfo } from '@/lib/mrgnlend';
// import { numeralFormatter, usdFormatter, usdFormatterDyn } from '@/lib';
// import { Loader } from '@/components/ui/loader';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { InfoCircledIcon } from '@radix-ui/react-icons';
// import {
//   PortfolioAssetCard,
//   PortfolioAssetCardSkeleton,
// } from '../PortfolioAssetCard';
// import { LendingModes } from '@/types/type';

// export const LendingPortfolio = () => {
//   const router = useRouter();
//   const [connected] = useUiStore((state) => [state.connected]);
//   const [walletConnectionDelay, setWalletConnectionDelay] =
//     React.useState(false);
//   // const [selectedAccount] = useMrgnlendStore((state) => [state.selectedAccount]);
//   const [
//     selectedAccount,
//     isStoreInitialized,
//     sortedBanks,
//     accountSummary,
//     isRefreshingStore,
//   ] = useMrgnlendStore((state) => [
//     state.selectedAccount,
//     state.initialized,
//     state.extendedBankInfos,
//     state.accountSummary,
//     state.isRefreshingStore,
//   ]);

//   const [setLendingMode] = useUiStore((state) => [state.setLendingMode]);

//   //   const [userPointsData] = useUserProfileStore((state) => [
//   //     state.userPointsData,
//   //   ]);

//   const lendingBanks = React.useMemo(
//     () =>
//       sortedBanks && isStoreInitialized
//         ? (
//             sortedBanks.filter(
//               (b) =>
//                 b.isActive &&
//                 'balanceWithLendingPosition' in b &&
//                 b.balanceWithLendingPosition.lendingPosition?.isLending,
//             ) as ActiveBankInfo[]
//           ).sort((a, b) => {
//             const bValue =
//               b.balanceWithLendingPosition.lendingPosition?.usdValue ?? 0;
//             const aValue =
//               a.balanceWithLendingPosition.lendingPosition?.usdValue ?? 0;
//             return bValue - aValue;
//           })
//         : [],
//     [sortedBanks, isStoreInitialized],
//   ) as ActiveBankInfo[];

//   const borrowingBanks = React.useMemo(
//     () =>
//       sortedBanks && isStoreInitialized
//         ? (
//             sortedBanks.filter(
//               (b) =>
//                 b.isActive &&
//                 'balanceWithLendingPosition' in b &&
//                 !b.balanceWithLendingPosition.lendingPosition?.isLending,
//             ) as ActiveBankInfo[]
//           ).sort((a, b) => {
//             const bValue =
//               b.balanceWithLendingPosition.lendingPosition?.usdValue ?? 0;
//             const aValue =
//               a.balanceWithLendingPosition.lendingPosition?.usdValue ?? 0;
//             return bValue - aValue;
//           })
//         : [],
//     [sortedBanks, isStoreInitialized],
//   ) as ActiveBankInfo[];

//   const accountSupplied = React.useMemo(
//     () =>
//       accountSummary
//         ? accountSummary.lendingAmount > 10000
//           ? usdFormatterDyn.format(Math.round(accountSummary.lendingAmount))
//           : usdFormatter.format(accountSummary.lendingAmount)
//         : '-',
//     [accountSummary],
//   );
//   const accountBorrowed = React.useMemo(
//     () =>
//       accountSummary
//         ? accountSummary.borrowingAmount > 10000
//           ? usdFormatterDyn.format(accountSummary.borrowingAmount)
//           : usdFormatter.format(accountSummary.borrowingAmount)
//         : '-',
//     [accountSummary],
//   );
//   const accountNetValue = React.useMemo(
//     () =>
//       accountSummary
//         ? accountSummary.balanceUnbiased > 10000
//           ? usdFormatterDyn.format(accountSummary.balanceUnbiased)
//           : usdFormatter.format(accountSummary.balanceUnbiased)
//         : '-',
//     [accountSummary],
//   );

//   const lendingAmountWithBiasAndWeighted = React.useMemo(
//     () =>
//       accountSummary?.lendingAmountWithBiasAndWeighted
//         ? accountSummary.lendingAmountWithBiasAndWeighted > 10000
//           ? usdFormatterDyn.format(
//               Math.round(accountSummary.lendingAmountWithBiasAndWeighted),
//             )
//           : usdFormatter.format(accountSummary.lendingAmountWithBiasAndWeighted)
//         : '-',
//     [accountSummary],
//   );

//   const borrowingAmountWithBiasAndWeighted = React.useMemo(
//     () =>
//       accountSummary?.borrowingAmountWithBiasAndWeighted
//         ? accountSummary.borrowingAmountWithBiasAndWeighted > 10000
//           ? usdFormatterDyn.format(
//               Math.round(accountSummary.borrowingAmountWithBiasAndWeighted),
//             )
//           : usdFormatter.format(
//               accountSummary.borrowingAmountWithBiasAndWeighted,
//             )
//         : '-',
//     [accountSummary],
//   );

//   const healthColor = React.useMemo(() => {
//     if (accountSummary.healthFactor) {
//       let color: string;

//       if (accountSummary.healthFactor >= 0.5) {
//         color = '#75BA80'; // green color " : "#",
//       } else if (accountSummary.healthFactor >= 0.25) {
//         color = '#B8B45F'; // yellow color
//       } else {
//         color = '#CF6F6F'; // red color
//       }

//       return color;
//     } else {
//       return '#fff';
//     }
//   }, [accountSummary.healthFactor]);

//   const isLoading = React.useMemo(
//     () =>
//       (!isStoreInitialized ||
//         walletConnectionDelay ||
//         isRefreshingStore ||
//         (!isStoreInitialized && accountSummary.balance === 0)) &&
//       !lendingBanks.length &&
//       !borrowingBanks.length,
//     [
//       isStoreInitialized,
//       walletConnectionDelay,
//       isRefreshingStore,
//       accountSummary.balance,
//       lendingBanks,
//       borrowingBanks,
//     ],
//   );

//   // Introduced this useEffect to show the loader for 2 seconds after wallet connection. This is to avoid the flickering of the loader, since the isRefreshingStore isnt set immediately after the wallet connection.
//   React.useEffect(() => {
//     if (connected) {
//       setWalletConnectionDelay(true);
//       const timer = setTimeout(() => {
//         setWalletConnectionDelay(false);
//       }, 2000);

//       return () => clearTimeout(timer);
//     }
//   }, [connected]);

//   if (isStoreInitialized && !connected) {
//     // TODO: Add wallet button
//     return <div>Wallet button</div>;
//     // return <WalletButton />;
//   }

//   //   if (isLoading) {
//   //     return <Loader label={connected ? 'Loading positions' : 'Loading'} />;
//   //   }

//   if (isStoreInitialized && connected) {
//     if (!lendingBanks.length && !borrowingBanks.length) {
//       return (
//         <p className="mt-4 text-center text-muted-foreground">
//           You do not have any open positions.
//           <br className="md:hidden" />{' '}
//           <Link
//             href="/"
//             className="border-b border-muted-foreground transition-colors hover:border-transparent"
//           >
//             Explore the pools
//           </Link>{' '}
//           and make your first deposit!
//         </p>
//       );
//     }
//   }

//   return (
//     <div className="mb-10 w-full space-y-3 rounded-xl bg-background-gray-dark p-4  md:p-6">
//       {/* <h2 className="text-xl font-medium">Lend/borrow</h2> */}
//       <div className="text-muted-foreground">
//         {/* <dl className="flex items-center justify-between gap-2">
          
//           <dd
//             className="text-xl font-medium md:text-2xl"
//             style={{ color: healthColor }}
//           >
//             {numeralFormatter(parseFloat(accountSummary.healthFactor) * 100)}%
//           </dd>
//         </dl> */}
//         {/* <div className="bg-background-gray-light h-2 rounded-full">
//           <div
//             className="h-2 rounded-full"
//             style={{
//               backgroundColor: healthColor,
//               width: `${parseFloat(accountSummary.healthFactor) * 100}%`,
//             }}
//           />
//         </div> */}
//         <PortfolioUserStats
//           netValue={accountNetValue}
//           points={numeralFormatter(accountSummary.healthFactor)}
//           weightedLend={lendingAmountWithBiasAndWeighted}
//           weightedBorrow={borrowingAmountWithBiasAndWeighted}
//           accountSummary={accountSummary}
//         />
//       </div>
//       <div className="flex flex-col flex-wrap justify-between gap-8 md:flex-row md:gap-20">
//         <div className="flex flex-1 flex-col gap-4 md:min-w-[340px]">
//           <dl className="flex items-center justify-between gap-2 ">
//             <dt className="text-xl font-medium">Supplied</dt>
//             <dt className="text-muted-foreground">{accountSupplied}</dt>
//           </dl>
//           {isStoreInitialized ? (
//             lendingBanks.length > 0 ? (
//               <div className="flex flex-col gap-4">
//                 {lendingBanks.map(
//                   (bank) =>
//                     bank.balanceWithLendingPosition.lendingPosition?.amount &&
//                     bank.balanceWithLendingPosition.lendingPosition.amount >
//                       0.00000001 && (
//                       <PortfolioAssetCard
//                         key={bank.token.symbol}
//                         bank={bank}
//                         isInLendingMode={true}
//                         isBorrower={borrowingBanks.length > 0}
//                         selectedAccount={selectedAccount}
//                       />
//                     ),
//                 )}
//               </div>
//             ) : (
//               <div
//                 color="#868E95"
//                 className="flex gap-1 font-aeonik text-sm font-[300]"
//               >
//                 No lending positions found.
//               </div>
//             )
//           ) : (
//             <PortfolioAssetCardSkeleton />
//           )}
//         </div>
//         <div className="flex flex-1 flex-col gap-4 md:min-w-[340px]">
//           <dl className="flex items-center justify-between gap-2">
//             <dt className="text-xl font-medium">Borrowed</dt>
//             <dt className="text-muted-foreground">{accountBorrowed}</dt>
//           </dl>
//           {isStoreInitialized ? (
//             borrowingBanks.length > 0 ? (
//               <div className="flex flex-col gap-4">
//                 {borrowingBanks.map((bank) => (
//                   <PortfolioAssetCard
//                     key={bank.token.symbol}
//                     bank={bank}
//                     isInLendingMode={false}
//                     isBorrower={borrowingBanks.length > 0}
//                     selectedAccount={selectedAccount}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div
//                 color="#868E95"
//                 className="flex gap-1 font-aeonik text-sm font-[300]"
//               >
//                 No borrow positions found.{' '}
//                 <button
//                   className="border-b border-primary/50 transition-colors hover:border-primary"
//                   onClick={() => {
//                     setLendingMode(LendingModes.BORROW);
//                     router.push('/');
//                   }}
//                 >
//                   Search the pools
//                 </button>{' '}
//                 and open a new borrow.
//               </div>
//             )
//           ) : (
//             <PortfolioAssetCardSkeleton />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
