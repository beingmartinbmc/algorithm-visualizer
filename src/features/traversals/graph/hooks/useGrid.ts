import { useState, useCallback } from 'react';
import type { GridMatrix, Position } from '../types/graph';
import { NodeType } from '../types/graph';

const DEFAULT_ROWS = 25;
const DEFAULT_COLS = 50;

const DEFAULT_START: Position = { row: 12, col: 10 };
const DEFAULT_END: Position = { row: 12, col: 39 };

function createNode(row: number, col: number): import('../types/graph').GridNode {
  return {
    row,
    col,
    type: NodeType.EMPTY,
    distance: Infinity,
    heuristic: 0,
    totalCost: Infinity,
    parent: null,
    isVisited: false,
  };
}

function createInitialGrid(rows: number, cols: number, start: Position, end: Position): GridMatrix {
  const grid: GridMatrix = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const node = createNode(r, c);
      if (r === start.row && c === start.col) node.type = NodeType.START;
      else if (r === end.row && c === end.col) node.type = NodeType.END;
      row.push(node);
    }
    grid.push(row);
  }
  return grid;
}

export type DrawMode = 'wall' | 'eraser' | 'start' | 'end' | null;

export function useGrid() {
  const [grid, setGrid] = useState<GridMatrix>(() =>
    createInitialGrid(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END)
  );
  const [startPos, setStartPos] = useState<Position>(DEFAULT_START);
  const [endPos, setEndPos] = useState<Position>(DEFAULT_END);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('wall');

  const resetGrid = useCallback(() => {
    setGrid(createInitialGrid(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END));
    setStartPos(DEFAULT_START);
    setEndPos(DEFAULT_END);
  }, []);

  const clearVisualization = useCallback(() => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((node) => ({
          ...node,
          type:
            node.type === NodeType.VISITED || node.type === NodeType.PATH || node.type === NodeType.EXPLORING
              ? NodeType.EMPTY
              : node.type,
          isVisited: false,
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          parent: null,
        }))
      )
    );
  }, []);

  const handleNodeInteraction = useCallback(
    (row: number, col: number) => {
      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((n) => ({ ...n })));
        const node = newGrid[row][col];

        if (drawMode === 'start') {
          if (node.type === NodeType.END) return prev;
          newGrid[startPos.row][startPos.col].type = NodeType.EMPTY;
          node.type = NodeType.START;
          setStartPos({ row, col });
          return newGrid;
        }

        if (drawMode === 'end') {
          if (node.type === NodeType.START) return prev;
          newGrid[endPos.row][endPos.col].type = NodeType.EMPTY;
          node.type = NodeType.END;
          setEndPos({ row, col });
          return newGrid;
        }

        if (node.type === NodeType.START || node.type === NodeType.END) return prev;

        if (drawMode === 'wall') {
          node.type = NodeType.WALL;
        } else if (drawMode === 'eraser') {
          node.type = NodeType.EMPTY;
        }

        return newGrid;
      });
    },
    [drawMode, startPos, endPos]
  );

  const setNodeType = useCallback((row: number, col: number, type: NodeType) => {
    setGrid((prev) => {
      const newGrid = prev.map((r) => r.map((n) => ({ ...n })));
      newGrid[row][col].type = type;
      return newGrid;
    });
  }, []);

  const generateMaze = useCallback(() => {
    const newGrid = createInitialGrid(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END);
    for (let r = 0; r < DEFAULT_ROWS; r++) {
      for (let c = 0; c < DEFAULT_COLS; c++) {
        if (
          newGrid[r][c].type !== NodeType.START &&
          newGrid[r][c].type !== NodeType.END &&
          Math.random() < 0.3
        ) {
          newGrid[r][c].type = NodeType.WALL;
        }
      }
    }
    setGrid(newGrid);
    setStartPos(DEFAULT_START);
    setEndPos(DEFAULT_END);
  }, []);

  return {
    grid,
    startPos,
    endPos,
    isDrawing,
    drawMode,
    setDrawMode,
    setIsDrawing,
    resetGrid,
    clearVisualization,
    handleNodeInteraction,
    setNodeType,
    generateMaze,
  };
}
