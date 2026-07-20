// @vitest-environment jsdom
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TarotCardFace } from "@/components/tarot/TarotCardFace";

vi.mock("next/image", () => ({
  default: ({
    fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    void fill;
    return <img {...props} />;
  },
}));

const props = {
  name: "愚者",
  nameEn: "The Fool",
  label: "0",
  seed: 1,
  suit: "major" as const,
};

afterEach(cleanup);

describe("TarotCardFace", () => {
  it("renders a supplied local card image with an orientation-aware alt text", () => {
    render(
      <TarotCardFace {...props} image="/tarot/rws/major-0.webp" reversed />,
    );
    expect(
      screen.getByAltText("愚者（The Fool）逆位牌面").getAttribute("src"),
    ).toBe("/tarot/rws/major-0.webp");
  });

  it("keeps the abstract card face when no image is available", () => {
    render(<TarotCardFace {...props} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("愚者")).toBeTruthy();
  });

  it("falls back to the abstract face after an image load error", () => {
    render(<TarotCardFace {...props} image="/tarot/rws/missing.webp" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("愚者")).toBeTruthy();
  });
});
