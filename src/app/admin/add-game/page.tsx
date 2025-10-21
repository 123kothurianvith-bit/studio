import AddGameForm from '@/components/add-game-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddGamePage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
       <div className="mb-8">
        <Button asChild variant="ghost" className="-ml-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Add New Game</h1>
            <p className="text-muted-foreground">
                Fill in the game details below. Use the AI generator for a head start on the description.
            </p>
        </div>
        <AddGameForm />
      </div>
    </div>
  );
}
