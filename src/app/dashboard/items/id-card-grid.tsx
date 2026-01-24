'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import Image from 'next/image'

interface IDCardData {
    id: string
    studentName: string
    dojoName: string
    category: string
    rank: string
    eventName: string
    date: string
}

export function IDCardGrid({ cards }: { cards: IDCardData[] }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
            <h2 className="text-xl font-semibold">Generated {cards.length} ID Cards</h2>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print Cards
            </Button>
        </div>

        <div id="printable-area" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 print:grid-cols-2 print:gap-2">
            {cards.map((card) => (
                <div key={card.id} className="id-card flex flex-col items-center justify-between p-4 shadow-sm">
                    {/* Header */}
                    <div className="w-full text-center border-b pb-2">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-primary">{card.eventName}</h3>
                        <p className="text-[10px] text-muted-foreground">{card.date}</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-2">
                        <div className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                             {/* Placeholder for Photo */}
                             <span className="text-2xl font-bold text-muted-foreground">
                                {card.studentName.charAt(0)}
                             </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none">{card.studentName}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{card.dojoName}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full pt-2 border-t mt-auto">
                        <div className="flex justify-between items-end text-xs">
                           <div className="text-left">
                                <p className="font-semibold text-primary/80">Rank</p>
                                <p className="capitalize font-bold">{card.rank}</p>
                           </div>
                           <div className="text-right">
                                <p className="font-semibold text-primary/80">Category</p>
                                <p className="max-w-[120px] truncate font-bold" title={card.category}>{card.category || 'N/A'}</p>
                           </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}
