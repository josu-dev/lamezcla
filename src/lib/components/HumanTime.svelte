<script lang="ts">
  // Removed onDestroy/effects as interval is gone

  type Props = {
    /** The date string in a format parseable by new Date() (ISO 8601 recommended). ASSUMED TO BE VALID. */
    utc: string;
    /** Display time relative to now? (Defaults to false) */
    as_relative?: boolean;
    // update_interval prop removed
  };

  // --- Props ---
  // Assume props are always valid as requested
  let { utc, as_relative = false }: Props = $props();

  // --- No explicit State needed for now, intervalId, or error ---

  // --- Helper Functions (Plain JS Date Calculations) ---

  /** Formats a date object to dd/MM/yyyy */
  function formatAbsoluteDate(date: Date): string {
    // No error check here - assumes valid date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /** Gets the number of days in a specific month of a year */
  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Calculates the calendar difference between two dates.
   * Returns an object { years, months, days, hours, minutes, seconds }.
   * Assumes valid Date objects.
   */
  function calculateRelativeDuration(
    d1: Date,
    d2: Date
  ): {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    let start = d1;
    let end = d2;

    if (d1.getTime() > d2.getTime()) {
      start = d2;
      end = d1;
    }

    let yearDiff = end.getFullYear() - start.getFullYear();
    let monthDiff = end.getMonth() - start.getMonth();
    let dayDiff = end.getDate() - start.getDate();
    let hourDiff = end.getHours() - start.getHours();
    let minuteDiff = end.getMinutes() - start.getMinutes();
    let secondDiff = end.getSeconds() - start.getSeconds();

    if (secondDiff < 0) {
      secondDiff += 60;
      minuteDiff--;
    }
    if (minuteDiff < 0) {
      minuteDiff += 60;
      hourDiff--;
    }
    if (hourDiff < 0) {
      hourDiff += 24;
      dayDiff--;
    }
    if (dayDiff < 0) {
      const daysInLastFullMonth = getDaysInMonth(end.getFullYear(), end.getMonth() - 1);
      dayDiff += daysInLastFullMonth;
      monthDiff--;
    }
    if (monthDiff < 0) {
      monthDiff += 12;
      yearDiff--;
    }

    return {
      years: yearDiff >= 0 ? yearDiff : 0,
      months: monthDiff >= 0 ? monthDiff : 0,
      days: dayDiff >= 0 ? dayDiff : 0,
      hours: hourDiff >= 0 ? hourDiff : 0,
      minutes: minuteDiff >= 0 ? minuteDiff : 0,
      seconds: secondDiff >= 0 ? secondDiff : 0,
    };
  }

  // --- Derived State ---

  // Directly parse the date string. Assumes success.
  let parsedDate = $derived(new Date(utc));

  // Calculate absolute date format
  let absolute = $derived.by(() => {
    // No error check needed per requirement
    return formatAbsoluteDate(parsedDate);
  });

  // Calculate relative time duration (only calculates when props change)
  let relativeDuration = $derived.by(() => {
    // Use current time *at the moment of calculation*
    // This will NOT update automatically over time
    const calculationTime = new Date();
    const _parsedDate = parsedDate; // Ensure dependency

    // No error check needed per requirement
    const isPast = calculationTime.getTime() > _parsedDate.getTime();
    const duration = calculateRelativeDuration(_parsedDate, calculationTime);
    return { duration, isPast };
  });

  // Format the relative time string based on the duration
  let relativeFormatted = $derived.by(() => {
    const relDur = relativeDuration; // Ensure dependency
    if (!relDur) return ""; // Should not happen if date is valid

    const { duration, isPast } = relDur;
    const units = [
      { unit: "year", value: duration.years },
      { unit: "month", value: duration.months },
      { unit: "day", value: duration.days },
      { unit: "hour", value: duration.hours },
      { unit: "min", value: duration.minutes },
      { unit: "sec", value: duration.seconds },
    ];

    const significantUnits = units.filter((u) => u.value > 0);

    if (significantUnits.length === 0) {
      return "just now";
    }

    const topTwoUnits = significantUnits.slice(0, 2);

    const formattedParts = topTwoUnits.map((u) => {
      const unitName = u.value === 1 ? u.unit : `${u.unit}s`;
      return `${u.value} ${unitName}`;
    });

    const timeString = formattedParts.join(", ");
    const suffix = isPast ? "ago" : "from now";

    // Handle case where diff is < 1s
    if (timeString.trim() === "") return "just now";

    return `${timeString} ${suffix}`;
  });
</script>

<span title={`Full date: ${parsedDate.toLocaleString()}`}>
  {#if as_relative}
    {relativeFormatted}
  {:else}
    {absolute}
  {/if}
</span>
