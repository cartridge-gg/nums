import { useMemo, useState, useRef, useLayoutEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const data: { rank: number, player: string, score: number, numsReward: number, prize?: string }[] = [
  {
    rank: 1,
    player: "clicksave",
    score: 16,
    numsReward: 17215,
    prize: "52%",
  },
  {
    rank: 2,
    player: "bal7hazar",
    score: 16,
    numsReward: 17215,
    prize: "26%",
  },
  {
    rank: 3,
    player: "ashe",
    score: 15,
    numsReward: 10715,
    prize: "13%",
  },
  {
    rank: 4,
    player: "glihm",
    score: 15,
    numsReward: 10715,
    prize: "6%",
  },
  {
    rank: 5,
    player: "flippertherichdolphin",
    score: 15,
    numsReward: 10715,
    prize: "3%",
  },
  {
    rank: 6,
    player: "steebchen",
    score: 15,
    numsReward: 10715,
  },
  {
    rank: 7,
    player: "clicksave",
    score: 14,
    numsReward: 6715,
  },
  {
    rank: 8,
    player: "nasr",
    score: 14,
    numsReward: 6715,
  },
  {
    rank: 9,
    player: "neo",
    score: 13,
    numsReward: 4215,
  },
  {
    rank: 10,
    player: "broody",
    score: 12,
    numsReward: 2415,
  },
  {
    rank: 11,
    player: "bal7hazar",
    score: 14,
    numsReward: 1815,
  },
  {
    rank: 12,
    player: "bal7hazar",
    score: 14,
    numsReward: 1815,
  },
]
const bigdata = [...data].map((item, index) => ({ ...item, rank: index + 1 }));

export type LeaderboardProps = {
}

export const Leaderboard = ({ }: LeaderboardProps) => {
  const [page, setPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(784);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableHeight, setTableHeight] = useState(378); // 38px header + 10 rows × 34px
  const paginationRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(bigdata.length / rowsPerPage);

  // Measure container dimensions and calculate rows per page
  useLayoutEffect(() => {
    if (!paginationRef.current || !spacerRef.current) return;

    const updateDimensions = () => {
      if (!paginationRef.current || !spacerRef.current) return;
      
      // Update width
      setContainerWidth(paginationRef.current.offsetWidth);

      // Calculate available height for table content
      const containerHeight = spacerRef.current.clientHeight;
      
      if (containerHeight === 0) return; // Wait for layout to be ready
      
      // Header height: 22px (text) + 16px (pb-4) = 38px
      const headerHeight = 38;
      // Each row is 34px (leading-[34px] from font-ppneuebit)
      const rowHeight = 34;
      // Subtract header and small buffer (5px) to ensure we don't overflow
      const availableHeight = containerHeight - headerHeight - 5;
      // Calculate only complete rows that fit
      const calculatedRows = Math.floor(availableHeight / rowHeight);
      
      const newRowsPerPage = Math.max(5, calculatedRows);
      // Total height = header + rows
      const newTableHeight = headerHeight + (newRowsPerPage * rowHeight);
      
      if (newRowsPerPage !== rowsPerPage || newTableHeight !== tableHeight) {
        setRowsPerPage(newRowsPerPage);
        setTableHeight(newTableHeight);
        // Adjust current page if needed
        const newTotalPages = Math.ceil(bigdata.length / newRowsPerPage);
        if (page > newTotalPages) {
          setPage(newTotalPages);
        }
      }
    };

    // Delay initial calculation to ensure layout is complete
    const timeoutId = setTimeout(updateDimensions, 0);

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(paginationRef.current);
    observer.observe(spacerRef.current);
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [rowsPerPage, page, tableHeight]);

  // Calculate max slots (pages + ellipsis) based on container width
  const maxVisibleSlots = useMemo(() => {
    if (containerWidth === 0) return 15; // Default value before measurement
    
    // Arrows: 40px + 40px = 80px
    // Gaps between arrows and pages: 36px + 36px = 72px
    // Safety buffer: 30px (to prevent overflow on edge cases)
    // Total reserved: 182px
    const reservedWidth = 182;
    const availableWidth = containerWidth - reservedWidth;
    const slotWidth = 60; // 48px button/ellipsis + 12px gap
    const maxSlots = Math.floor(availableWidth / slotWidth);
    return Math.max(7, Math.min(maxSlots, 27)); // Min 7, max 27 slots
  }, [containerWidth]);

  // Calculate max pages excluding ellipsis slots
  const maxVisiblePages = useMemo(() => {
    // Reserve 2 slots for potential ellipsis
    return Math.max(5, maxVisibleSlots - 2);
  }, [maxVisibleSlots]);

  const rows = useMemo(() => {
    return bigdata.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  }, [page, rowsPerPage]);

  // Generate page numbers with ellipsis based on available space
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if they fit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate how many pages to show - keep it constant
      const basePagesToShow = maxVisiblePages - 2; // -2 for both ellipsis slots
      const sidePages = Math.floor((basePagesToShow - 1) / 2); // -1 for current page
      
      let start: number;
      let end: number;
      
      // Determine if we're near the beginning or end
      const isNearStart = page <= sidePages + 2; // +2 to account for page 1 and transition
      const isNearEnd = page >= totalPages - sidePages - 1; // -1 for transition
      
      if (isNearStart) {
        // Near the beginning: no left ellipsis, add 2 extra pages to fill the slot
        start = 2;
        end = Math.min(totalPages - 1, basePagesToShow + 2);
      } else if (isNearEnd) {
        // Near the end: no right ellipsis, add 2 extra pages to fill the slot
        start = Math.max(2, totalPages - basePagesToShow - 1);
        end = totalPages - 1;
      } else {
        // In the middle: both ellipsis present
        start = page - sidePages;
        end = page + sidePages;
      }
      
      // Always show first page
      pages.push(1);
      
      // Add ellipsis if there's a gap after first page
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // Show pages in the range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap before last page
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="select-none w-full h-full p-6 rounded-lg bg-[rgba(0,0,0,0.04)] flex flex-col" style={{ boxShadow: '1px 1px 0px 0px rgba(255, 255, 255, 0.12) inset, 1px 1px 0px 0px rgba(0, 0, 0, 0.12)' }}>
      <div ref={spacerRef} className="flex-1 min-h-0">
        <div ref={tableContainerRef} style={{ height: `${tableHeight}px` }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3 pb-4 tracking-wider text-purple-300 text-lg leading-[22px]" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Rank</TableHead>
                <TableHead className="pb-4 tracking-wider text-purple-300 text-lg leading-[22px]" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Player</TableHead>
                <TableHead className="pb-4 tracking-wider text-purple-300 text-lg leading-[22px]" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Score</TableHead>
                <TableHead className="pb-4 tracking-wider text-purple-300 text-lg leading-[22px]" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Nums Reward</TableHead>
                <TableHead className="pr-3 pb-4 tracking-wider text-purple-300 text-lg leading-[22px]" style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)' }}>Prize</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-ppneuebit text-2xl leading-[34px]">
              {rows.map((item) => (
                <TableRow key={item.rank}>
                  <TableCell className="pl-3">{item.rank}</TableCell>
                  <TableCell>{item.player}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{item.numsReward}</TableCell>
                  <TableCell className="pr-3">{item.prize}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div ref={paginationRef} className="w-full flex items-center mt-6" style={{ gap: '36px' }}>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(Math.max(1, page - 1))}
              isDisabled={page === 1}
              className={page === 1 ? "pointer-events-none" : "cursor-pointer"}
            />
          </PaginationItem>
          
          <div className="flex-1 flex justify-center gap-3">
            {getPageNumbers().map((pageNum, idx) => (
              pageNum === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    <p className="translate-y-0.5">{pageNum}</p>
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
          </div>
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              isDisabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none" : "cursor-pointer"}
            />
          </PaginationItem>
        </div>
      )}
    </div>
  )
}
