import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Tooltip,
  Button
} from "@heroui/react";
import React, { useMemo } from "react";
import { HexColorPicker } from "react-colorful";

type PixelInput = Uint8ClampedArray;

type Props = {
  pixels: PixelInput;
  width: number;
  height?: number; // if omitted, inferred from pixels length and width
  pixelSize?: number; // diameter in px (default 10)
  gap?: number; // gap between pixels in px (default 1)
  className?: string;
  showOutline?: boolean; // subtle outline for each pixel
  isTree?: boolean; // render as tree pixels
  setPixels?: (pixels: PixelInput) => void;
  setOffsets?: (xOffset: number, yOffset: number) => void;
  pixelHeight: number; // explicit pixel height for tree rendering
  pixelWidth: number; // explicit pixel width for tree rendering
};

const DEFAULT_CHANNELS = 4;

export default function PixelDisplay({
  pixels,
  width,
  height,
  pixelSize = 10,
  gap = 1,
  className,
  showOutline = false,
  isTree = false,
  setPixels,
  setOffsets,
  pixelHeight,
  pixelWidth,
}: Props) {
  const [editColor, setEditColor] = React.useState<{
    r: number;
    g: number;
    b: number;
    a: number;
    id?: string;
  }>({ r: 255, g: 0, b: 0, a: 255, id: "red" });
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const inferred = useMemo(() => {
    const totalPixels = (() => {
      if (Array.isArray(pixels)) return pixels.length;
      if (pixels instanceof Uint8ClampedArray) return pixels.length;
      return 0;
    })();

    // If pixels is a flat numeric array (RGB/RGBA/grayscale) detect channels
    let channels = 0;
    if (
      pixels instanceof Uint8ClampedArray ||
      (Array.isArray(pixels) && typeof pixels[0] === "number")
    ) {
      if (
        totalPixels % 4 === 0 &&
        (height === undefined || height === undefined)
      )
        channels = DEFAULT_CHANNELS;
      else if (totalPixels % 3 === 0) channels = 3;
      else channels = 1;
    }

    const pixelCount =
      channels > 0 ? Math.floor(totalPixels / channels) : totalPixels;

    const h =
      height ?? Math.min(pixelHeight, Math.floor(pixelCount / Math.max(1, width)));

    console.log(`Inferred pixel data: channels=${channels}, pixelCount=${pixelCount}, height=${h}, width=${width}`);
    return { channels, pixelCount, height: h };
  }, [pixels, width, height]);
  const [sliderYValue, setSliderYValue] = React.useState<number>(0);
  const [sliderXValue, setSliderXValue] = React.useState<number>(0);


  const yOffset = useMemo(() => {
    return Math.round(sliderYValue + (pixelHeight ?? 50) / 2 - (inferred.height / 2));
  }, [sliderYValue, pixelHeight, inferred.height]);

  const colors = useMemo(() => {
    const out: string[] = [];
    const cells = width * (pixelHeight || inferred.height);

    if (
      pixels instanceof Uint8ClampedArray ||
      (Array.isArray(pixels) && typeof pixels[0] === "number")
    ) {
      const arr = pixels as unknown as number[];
      const ch = inferred.channels || DEFAULT_CHANNELS;
      for (let i = 0; i < cells; i++) {
        const base = i * ch;
        if (ch === 4) {
          const r = arr[base] ?? 0;
          const g = arr[base + 1] ?? 0;
          const b = arr[base + 2] ?? 0;
          const a = (arr[base + 3] ?? 255) / 255;
          out.push(`rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`);
        } else if (ch === 3) {
          const r = arr[base] ?? 0;
          const g = arr[base + 1] ?? 0;
          const b = arr[base + 2] ?? 0;
          out.push(`rgb(${r}, ${g}, ${b})`);
        } else {
          const v = arr[base] ?? 0;
          out.push(`rgb(${v}, ${v}, ${v})`);
        }
      }
    } else {
      // Fallback: fill transparent
      for (let i = 0; i < cells; i++) out.push("transparent");
    }

    // pad out based on sliderYValue
    console.log(`Applying Y offset: ${yOffset}`);
    if (yOffset > 0) {
      for (let i = 0; i < yOffset * width; i++) {
        out.unshift("transparent");
      }
      out.splice(cells, yOffset * width);
    } else if (yOffset < 0) {
      const absOffset = -yOffset;
      for (let i = 0; i < absOffset * width; i++) {
        out.push("transparent");
      }
      out.splice(0, absOffset * width);
    }

    // shift the image on the xaxis based on sliderXValue  - positive values shift right, negative values shift left
    const xOffset = sliderXValue;
    console.log(`Applying X offset: ${xOffset}`);
    if (xOffset != 0) {
      for (let row = 0; row < (pixelHeight ?? inferred.height); row++) {
        const rowStart = row * width;
        const rowEnd = rowStart + width;
        // extract this row
        const rowArr = out.slice(rowStart, rowEnd);
        // clamp shift to row width
        let shift = xOffset;
        if (shift > width) shift = width;
        if (shift < -width) shift = -width;
        let newRow: string[] = [];

        if (shift > 0) {
          // shift right: prepend transparents, drop from end
          newRow = Array(shift)
            .fill("transparent")
            .concat(rowArr.slice(0, width - shift));
        } else if (shift < 0) {
          const s = -shift;
          // shift left: drop from start, append transparents
          newRow = rowArr.slice(s).concat(Array(s).fill("transparent"));
        } else {
          // no shift
          newRow = rowArr;
        }

        // replace the row segment in the flattened array
        out.splice(rowStart, width, ...newRow);
      }
    }

    return out;
  }, [
    pixels,
    inferred.channels,
    inferred.height,
    width,
    pixelHeight,
    sliderYValue,
    sliderXValue,
  ]);

  const rows = useMemo(() => {
    const r: string[][] = [];
    for (let y = 0; y < (pixelHeight ?? inferred.height); y++) {
      const row: string[] = [];
      for (let x = 0; x < pixelWidth; x++) {
        if (x >= width) {
          row.push("transparent");
          continue;
        }
        const idx = y * width + x;
        row.push(colors[idx] ?? "transparent");
      }
      r.push(row);
    }
    return r;
  }, [pixelHeight, inferred.height, pixelWidth, width, colors]);

  const pixelStyleBase: React.CSSProperties = {
    width: pixelSize,
    height: pixelSize,
    minWidth: pixelSize,
    minHeight: pixelSize,
    borderRadius: "50%",
    transition: "background-color 120ms linear",
    boxSizing: "border-box",
    border: showOutline ? `1px solid rgba(145, 145, 145, 0.56)` : undefined,
  };

  const editColors = useMemo(() => {
    return [
      { r: 255, g: 0, b: 0, a: 255, id: "red" },
      { r: 0, g: 0, b: 255, a: 255, id: "blue" },
      { r: 255, g: 255, b: 255, a: 255, id: "white" },
      { r: 255, g: 255, b: 0, a: 255, id: "yellow" },
      { r: 0, g: 255, b: 0, a: 255, id: "green" },
      { r: 0, g: 255, b: 255, a: 255, id: "cyan" },
      { r: 255, g: 0, b: 255, a: 255, id: "magenta" },
      { r: 0, g: 0, b: 0, a: 0, id: "transparent" },
    ];
  }, []);

  const hexColor = useMemo(() => {
    const rHex = editColor.r.toString(16).padStart(2, "0");
    const gHex = editColor.g.toString(16).padStart(2, "0");
    const bHex = editColor.b.toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  }, [editColor]);

  const grabColorFromPixel = (index: number) => {
    const currentColor = colors[index];
    // parse currentColor to rgba
    const rgbaMatch = currentColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1], 10);
      const g = parseInt(rgbaMatch[2], 10);
      const b = parseInt(rgbaMatch[3], 10);
      const a = rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255;
      setEditColor({ r, g, b, a, id: "custom" });
    }
  };

  const handlePixelClick = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isEditing) {
      grabColorFromPixel(index);
      return;
    }
    const target = e.currentTarget;
    const pixelIndex = target.getAttribute("data-pixelindex");
    if (pixelIndex !== null) {
      // adjust pixel index based on sliderYValue and sliderXValue
      let adjustedIndex = parseInt(pixelIndex, 10);
      if (yOffset > 0) {
        adjustedIndex -= yOffset * width;
        if (adjustedIndex < 0) return; // clicked on padded area
      }

      const xOffset = sliderXValue;
      if (xOffset != 0) {
        const row = Math.floor(adjustedIndex / width);
        const col = adjustedIndex % width;
        const newCol = col - xOffset;
        if (newCol < 0 || newCol >= width) return; // clicked on padded area
        adjustedIndex = row * width + newCol;
      }

      console.log(
        `Clicked pixel index: ${pixelIndex}, adjusted index: ${adjustedIndex}`
      );

      // set background color to current selected color
      target.style.backgroundColor = `rgba(${editColor.r}, ${editColor.g}, ${
        editColor.b
      }, ${editColor.a / 255})`;
      // also update pixels state
      console.log("type of pixels:", typeof pixels, Array.isArray(pixels));
      let newPixels: PixelInput | undefined = undefined;
      if (typeof pixels === "object" && pixels instanceof Uint8ClampedArray) {
        newPixels = new Uint8ClampedArray(pixels);

        const ch = inferred.channels || 4;
        const base = adjustedIndex * ch;
        newPixels[base] = editColor.r;
        if (ch > 1) newPixels[base + 1] = editColor.g;
        if (ch > 2) newPixels[base + 2] = editColor.b;
        if (ch > 3) newPixels[base + 3] = editColor.a;
      }
      if (setPixels && newPixels) {
        setPixels(newPixels);
        console.log("Updated pixels state");
      }
    }
  };

  const calcRowGap = (rowIndex: number, adjustedOffset: number) => {
    if (!isTree) return gap;
    return (pixelSize * rowIndex * adjustedOffset) / pixelWidth + 0;
  };

  const calcRowWidth = (rowIndex: number, rowGap: number) => {
    const rowWidth = pixelWidth * (pixelSize + rowGap) - rowGap;
    return rowWidth;
  };

  return (
    <div className={className}>
      <div className="flex flex-row items-center justify-center h-full">
        <div
          role="img"
          aria-label="Pixel display"
          style={{
            cursor: isEditing
              ? "url('assets/images/pencil.svg') 0 20, pointer"
              : "url('assets/images/dropper.svg') 0 20, crosshair",
            padding: "10px 10px",
            overflow: isTree ? "visible" : "auto",
            // flexGrow: 1,
            // alignItems: "center",
            // justifyContent: "center",
          }}
        >
          {/* render each row as a grid of pixels. if it is a tree, the next row should be slightly offset to left and have a bigger gap */}
          {(() => {
            const adjustedOffset = isTree ? 1.3 : 1;
            const lastGap = isTree
              ? calcRowGap(rows.length - 1, adjustedOffset)
              : gap;
            const lastRowWidth =
              rows.length > 0 ? calcRowWidth(rows.length - 1, lastGap) : 0;
            return rows.map((rowPixels, rowIndex) => {
              const rowGap = isTree
                ? calcRowGap(rowIndex, adjustedOffset)
                : gap;

              const rowWidth = calcRowWidth(rowIndex, rowGap);
              const rowXoffset = isTree ? -rowWidth / 2 + lastRowWidth / 2 : 0;

              return (
                <div
                  key={rowIndex}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: rowGap,
                    left: rowXoffset,
                    position: "relative",
                    marginBottom: gap,
                  }}
                >
                  {rowPixels.map((color, colIndex) => (
                    <div
                      key={colIndex}
                      data-pixelindex={rowIndex * width + colIndex}
                      onClick={(e) => {
                        handlePixelClick(rowIndex * width + colIndex, e);
                      }}
                      style={{
                        ...pixelStyleBase,
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              );
            });
          })()}
        </div>
        <Slider
          label="Y Position"
          aria-label="Y Position"
          orientation="vertical"
          className="h-96 ml-4"
          value={-sliderYValue}
          minValue={-(pixelHeight ?? inferred.height) / 2}
          maxValue={(pixelHeight ?? inferred.height) / 2}
          step={1}
          onChange={(value: number) => {
            setSliderYValue(-value);
            if (setOffsets) {
              setOffsets(sliderXValue, value);
            }
          }}
        />
      </div>
      <Slider
        label="X Position"
        aria-label="X Position"
        orientation="horizontal"
        className="h-14"
        defaultValue={0}
        minValue={-width}
        maxValue={width}
        step={1}
        onChange={(value: number) => {
          setSliderXValue(value);
          if (setOffsets) {
            setOffsets(value, -sliderYValue);
          }
        }}
      />
      <div className="flex flex-row gap-4 mt-2">
        {editColors.map((color) => (
          <Tooltip key={color.id} content={`Select color: ${color.id}`}>
            <div
              key={color.id}
              className={`w-6 h-6 border`}
              style={{
                backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
              }}
              title={`Select color: ${color.id}`}
              data-color={color.id}
              onClick={() => setEditColor(color)}
              role="button"
              tabIndex={0}
            >
              {color.id === "transparent" ? (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #ccc, #ccc 10px, #fff 10px, #fff 20px)",
                  }}
                />
              ) : (
                " "
              )}
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-row gap-4 my-4">
        <Button
          size="sm"
          onPress={() => setIsEditing(!isEditing)}
          endContent={
            <div
              style={{
                backgroundColor: `rgba(${editColor?.r}, ${editColor?.g}, ${editColor?.b}, ${editColor?.a})`,
                width: 16,
              }}
            >
              &nbsp;
            </div>
          }
        >
          {isEditing ? "Stop Editing" : "Edit Pixels"}
        </Button>
        <Popover disableAnimation={true}>
          <PopoverTrigger>
            <Button size="sm">Select Color</Button>
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker
              color={hexColor}
              onChange={(newColor) => {
                // convert newColor from hex to rgba
                const r = parseInt(newColor.slice(1, 3), 16);
                const g = parseInt(newColor.slice(3, 5), 16);
                const b = parseInt(newColor.slice(5, 7), 16);
                setEditColor({ r, g, b, a: 255, id: "custom" });
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
