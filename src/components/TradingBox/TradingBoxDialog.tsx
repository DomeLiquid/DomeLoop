// import React from 'react';

// import { IconArrowLeft } from '@tabler/icons-react';

// import { TradingBox } from './TradingBox';
// import { useIsMobile } from '@/hooks/use-is-mobile';
// import { GroupData } from '@/app/stores/tradeStore';
// import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
// import { Desktop, Mobile } from '@/lib/mediaQueryUtils';

// type TradingBoxDialogProps = {
//   activeGroup: GroupData;
//   isTradingBoxTriggered?: boolean;
//   title: string;
//   children: React.ReactNode;
// };

// export const TradingBoxDialog = ({
//   activeGroup,
//   isTradingBoxTriggered = false,
//   title,
//   children,
// }: TradingBoxDialogProps) => {
//   const [isDialogOpen, setIsDialogOpen] = React.useState(false);
//   const isMobile = useIsMobile();

//   React.useEffect(() => {
//     setIsDialogOpen(isTradingBoxTriggered);
//   }, [setIsDialogOpen, isTradingBoxTriggered]);

//   return (
//     <Dialog
//       open={isDialogOpen}
//       modal={!isMobile}
//       onOpenChange={(open) => setIsDialogOpen(open)}
//     >
//       <Mobile>
//         {isDialogOpen && (
//           <div className="fixed inset-0 z-40 h-screen bg-background md:z-50 md:bg-background/80" />
//         )}
//         <DialogTrigger asChild>{children}</DialogTrigger>
//         <DialogContent
//           hideClose={true}
//           className="z-40 mt-20 flex justify-start border-none bg-transparent p-0 sm:rounded-2xl md:z-50 md:max-w-[520px] md:px-5 md:py-3"
//         >
//           <div>
//             <div
//               className="flex cursor-pointer items-center gap-2 pl-2 capitalize hover:underline"
//               onClick={() => setIsDialogOpen(false)}
//             >
//               <IconArrowLeft /> {`${title}`}
//             </div>
//             <div className="mb-8 h-screen p-4">
//               <TradingBox activeGroup={activeGroup} />
//             </div>
//           </div>
//         </DialogContent>
//       </Mobile>

//       <Desktop>
//         <DialogTrigger asChild>{children}</DialogTrigger>
//         <DialogContent
//           className="border-none bg-transparent p-0 sm:rounded-2xl md:flex md:max-w-[520px] md:px-5 md:py-3"
//           closeClassName="top-2 right-2"
//         >
//           <div className="p-4">
//             <TradingBox activeGroup={activeGroup} />
//           </div>
//         </DialogContent>
//       </Desktop>
//     </Dialog>
//   );
// };
