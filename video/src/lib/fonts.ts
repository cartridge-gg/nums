import { staticFile } from "remotion";

export function getFontFaces(): string {
	return `
    @font-face {
      font-family: "PixelGame";
      src: url("${staticFile("fonts/pixel-game.regular.otf")}") format("opentype");
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: "PPNeueBit";
      src: url("${staticFile("fonts/pp-neue-bit.bold.otf")}") format("opentype");
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: "DMMono-Regular";
      src: url("${staticFile("fonts/dm-mono.regular.ttf")}") format("truetype");
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: "Circular-LL";
      src: url("${staticFile("fonts/circular-ll.regular.ttf")}") format("truetype");
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: "Circular-LL";
      src: url("${staticFile("fonts/circular-ll.medium.ttf")}") format("truetype");
      font-weight: 500;
      font-style: normal;
    }
    @font-face {
      font-family: "Circular-LL-Book";
      src: url("${staticFile("fonts/circular-ll.book.ttf")}") format("truetype");
      font-weight: 450;
      font-style: normal;
    }
  `;
}
