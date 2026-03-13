import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  BarChart3,
  Calculator,
  Wrench,
  Users,
  FileText,
} from 'lucide-react';

export interface SpokeItem {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  icon: LucideIcon;
}

export const SPOKES: SpokeItem[] = [
  {
    id: 'property',
    title: 'Property Deep Dive',
    shortTitle: 'Property',
    description: 'Photos, unit mix, amenities, renovation scope',
    icon: Building2,
  },
  {
    id: 'market',
    title: 'Market Analysis',
    shortTitle: 'Market',
    description: 'Employment, demographics, rent comps, supply pipeline',
    icon: BarChart3,
  },
  {
    id: 'financials',
    title: 'Financial Explorer',
    shortTitle: 'Financials',
    description: 'Interactive scenarios, projections, benchmarks',
    icon: Calculator,
  },
  {
    id: 'business',
    title: 'Business Plan',
    shortTitle: 'Business',
    description: 'Value-add strategy, timeline, milestones',
    icon: Wrench,
  },
  {
    id: 'team',
    title: 'Team & Track Record',
    shortTitle: 'Team',
    description: 'Leadership, property management, realized performance',
    icon: Users,
  },
  {
    id: 'documents',
    title: 'Documents',
    shortTitle: 'Documents',
    description: 'Deal deck, executive summary, PPM request',
    icon: FileText,
  },
];
