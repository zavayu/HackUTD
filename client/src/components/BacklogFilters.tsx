import { Filter, Search, ChevronDown, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BacklogFiltersProps {
  onAISuggestion: (type: string) => void;
}

export function BacklogFilters({ onAISuggestion }: BacklogFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stories..."
          className="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sprint</DropdownMenuLabel>
          <DropdownMenuItem>Current Sprint</DropdownMenuItem>
          <DropdownMenuItem>Next Sprint</DropdownMenuItem>
          <DropdownMenuItem>Backlog</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          <DropdownMenuItem>High</DropdownMenuItem>
          <DropdownMenuItem>Medium</DropdownMenuItem>
          <DropdownMenuItem>Low</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Owner</DropdownMenuLabel>
          <DropdownMenuItem>Sarah Chen</DropdownMenuItem>
          <DropdownMenuItem>Alex Kumar</DropdownMenuItem>
          <DropdownMenuItem>Maria Garcia</DropdownMenuItem>
          <DropdownMenuItem>Unassigned</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI Suggestions</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>AI-Powered Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onAISuggestion('acceptance-criteria')}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm">Generate Acceptance Criteria</p>
                <p className="text-xs text-muted-foreground">
                  Auto-create criteria for selected stories
                </p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAISuggestion('summarize')}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm">Summarize Feedback</p>
                <p className="text-xs text-muted-foreground">
                  Get AI summary of user feedback
                </p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAISuggestion('prioritize')}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-500 mt-0.5" />
              <div>
                <p className="text-sm">Smart Prioritization</p>
                <p className="text-xs text-muted-foreground">
                  AI-based priority suggestions
                </p>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onAISuggestion('estimate')}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm">Estimate Story Points</p>
                <p className="text-xs text-muted-foreground">
                  Auto-estimate based on complexity
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <span className="text-sm">Sort by</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Priority (High to Low)</DropdownMenuItem>
          <DropdownMenuItem>Priority (Low to High)</DropdownMenuItem>
          <DropdownMenuItem>Story Points</DropdownMenuItem>
          <DropdownMenuItem>Recently Updated</DropdownMenuItem>
          <DropdownMenuItem>Assignee</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
