import { CheckIcon, UsersGroupRoundedIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Service, StaffMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StepStaffProps {
  eligibleStaff: StaffMember[];
  services: Service[];
  selectedStaffId: string | null;
  onSelectStaff: (staffId: string) => void;
  onChooseAnotherService: () => void;
}

function SelectedMark() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
      <CheckIcon size={14} aria-hidden="true" />
    </span>
  );
}

export function StepStaff({
  eligibleStaff,
  services,
  selectedStaffId,
  onSelectStaff,
  onChooseAnotherService,
}: StepStaffProps) {
  const serviceNames = new Map(
    services.map((service) => [service.id, service.name]),
  );

  if (eligibleStaff.length === 0) {
    return (
      <EmptyState
        title="No professionals available"
        description="No active professional is assigned to this service right now. Try a different service."
        action={
          <Button variant="secondary" onClick={onChooseAnotherService}>
            Choose another service
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={selectedStaffId === "any"}
        onClick={() => onSelectStaff("any")}
        className={cn(
          "flex w-full items-center gap-3 rounded-card border p-4 text-left transition-colors sm:p-5",
          selectedStaffId === "any"
            ? "border-brand bg-brand-tint/50 ring-1 ring-brand"
            : "border-line bg-card hover:border-line-strong",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand-tint text-brand-soft">
          <UsersGroupRoundedIcon size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            Any available professional
          </span>
          <span className="mt-0.5 block text-caption text-ink-secondary">
            We will match you with the first eligible professional for that time.
          </span>
        </span>
        {selectedStaffId === "any" ? <SelectedMark /> : null}
      </button>

      <ul className="grid gap-3">
        {eligibleStaff.map((member) => {
          const isSelected = selectedStaffId === member.id;
          const assigned = member.serviceIds
            .map((serviceId) => serviceNames.get(serviceId))
            .filter((name): name is string => Boolean(name))
            .join(" · ");

          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectStaff(member.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-card border p-4 text-left transition-colors sm:p-5",
                  isSelected
                    ? "border-brand bg-brand-tint/50 ring-1 ring-brand"
                    : "border-line bg-card hover:border-line-strong",
                )}
              >
                <Avatar name={member.name} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-ink">
                      {member.name}
                    </span>
                    <span className="text-caption text-ink-muted">
                      {member.role}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-caption text-ink-secondary">
                    {member.bio}
                  </span>
                  <span className="mt-1 block truncate text-caption text-ink-muted">
                    {assigned}
                  </span>
                </span>
                {isSelected ? <SelectedMark /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
