import { cleanup, fireEvent, render, screen } from "../../../../tests/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StorySection } from "./StorySection";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "tr" } }),
}));

describe("StorySection", () => {
  afterEach(() => cleanup());

  it("renders timeline items as accessible list entries", () => {
    render(
      <StorySection
        copy={{ storyLabel: "Hikayemiz", storyTitle: "Bizim hikayemiz" }}
        storyTimeline={[
          { date: "2020", title: "Tanıştık", description: "İlk gün", image: "/story.jpg" },
        ]}
      />,
    );

    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getByRole("listitem").textContent).toContain("Tanıştık");
    expect(screen.getByRole("img", { name: "Tanıştık" }).getAttribute("decoding")).toBe("async");
  });

  it("renders nothing when there are no timeline items", () => {
    const { container } = render(<StorySection storyTimeline={[]} />);
    expect(container.querySelector(".story-card")).toBeNull();
  });

  it("removes a broken story image without breaking the timeline", () => {
    render(
      <StorySection
        storyTimeline={[{ date: "2020", title: "Tanıştık", description: "İlk gün", image: "/missing.jpg" }]}
      />,
    );

    const image = screen.getByRole("img", { name: "Tanıştık" });
    fireEvent.error(image);

    expect(screen.queryByRole("img", { name: "Tanıştık" })).toBeNull();
    expect(screen.getByRole("listitem").textContent).toContain("Tanıştık");
  });
});
