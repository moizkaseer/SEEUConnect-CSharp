
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FilterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FilterTabs = ({ activeTab, setActiveTab }: FilterTabsProps) => {
  return (
    <div className="mb-6 px-1">
      <ToggleGroup 
        type="single" 
        value={activeTab} 
        onValueChange={(value) => value && setActiveTab(value)} 
        className="justify-start bg-secondary rounded-lg p-1 w-full"
      >
        <ToggleGroupItem 
          value="all" 
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md text-sm px-4"
        >
          All
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="events" 
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md text-sm px-4"
        >
          Events
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="opportunities" 
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md text-sm px-4"
        >
          Opportunities
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="announcements" 
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md text-sm px-4"
        >
          Announcements
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default FilterTabs;
