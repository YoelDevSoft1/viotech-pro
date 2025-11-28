"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  MoreVertical,
  Settings2,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DocumentRow {
  id: string;
  header: string;
  sectionType: string;
  status: "In Process" | "Done";
  target: string;
  limit: string;
  reviewer: string | null;
  level?: number;
}

const mockDocuments: DocumentRow[] = [
  { id: "1", header: "Cover page", sectionType: "Header", status: "In Process", target: "2024-01-15", limit: "2024-01-20", reviewer: "Eddie Lake", level: 0 },
  { id: "2", header: "Table of contents", sectionType: "Header", status: "In Process", target: "2024-01-15", limit: "2024-01-20", reviewer: null, level: 0 },
  { id: "3", header: "Executive summary", sectionType: "Header", status: "Done", target: "2024-01-10", limit: "2024-01-15", reviewer: "Jamik Tashpulatov", level: 0 },
  { id: "4", header: "Technical approach", sectionType: "Section", status: "In Process", target: "2024-01-20", limit: "2024-01-25", reviewer: null, level: 0 },
  { id: "5", header: "Design", sectionType: "Section", status: "In Process", target: "2024-01-20", limit: "2024-01-25", reviewer: "Eddie Lake", level: 1 },
  { id: "6", header: "Capabilities", sectionType: "Section", status: "In Process", target: "2024-01-20", limit: "2024-01-25", reviewer: null, level: 1 },
  { id: "7", header: "Integration with existing systems", sectionType: "Section", status: "In Process", target: "2024-01-20", limit: "2024-01-25", reviewer: null, level: 1 },
  { id: "8", header: "Innovation and Advantages", sectionType: "Section", status: "Done", target: "2024-01-18", limit: "2024-01-23", reviewer: "Jamik Tashpulatov", level: 0 },
  { id: "9", header: "Overview of EMIR's Innovative Solutions", sectionType: "Section", status: "In Process", target: "2024-01-22", limit: "2024-01-27", reviewer: null, level: 0 },
  { id: "10", header: "Advanced Algorithms and Machine Learning", sectionType: "Section", status: "In Process", target: "2024-01-22", limit: "2024-01-27", reviewer: null, level: 0 },
];

export function DocumentsTable() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleAll = () => {
    if (selectedRows.size === mockDocuments.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(mockDocuments.map(d => d.id)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Document Outline</CardTitle>
            <CardDescription className="text-xs mt-1">
              Manage your document sections and reviews
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Customize Columns
            </Button>
            <Button size="sm" className="gap-2 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-12 h-10">
                  <Checkbox
                    checked={selectedRows.size === mockDocuments.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-12 h-10"></TableHead>
                <TableHead className="h-10 text-xs font-medium">Header</TableHead>
                <TableHead className="h-10 text-xs font-medium">Section Type</TableHead>
                <TableHead className="h-10 text-xs font-medium">Status</TableHead>
                <TableHead className="h-10 text-xs font-medium">Target</TableHead>
                <TableHead className="h-10 text-xs font-medium">Limit</TableHead>
                <TableHead className="h-10 text-xs font-medium">Reviewer</TableHead>
                <TableHead className="w-12 h-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((row) => (
                <TableRow key={row.id} className="border-b hover:bg-muted/50">
                  <TableCell className="py-3">
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    {row.level && row.level > 0 ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <button
                        onClick={() => toggleExpand(row.id)}
                        className="p-0 hover:bg-transparent"
                      >
                        {expandedRows.has(row.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className={cn("text-sm font-medium", row.level && row.level > 0 && "pl-6")}>
                      {row.header}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground">{row.sectionType}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={row.status === "Done" ? "default" : "secondary"}
                      className={cn(
                        "gap-1.5 text-xs h-5",
                        row.status === "Done" && "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10"
                      )}
                    >
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        row.status === "Done" ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs">{row.target}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs">{row.limit}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    {row.reviewer ? (
                      <span className="text-xs">{row.reviewer}</span>
                    ) : (
                      <Select>
                        <SelectTrigger className="h-7 w-[140px] text-xs">
                          <SelectValue placeholder="Assign review..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eddie">Eddie Lake</SelectItem>
                          <SelectItem value="jamik">Jamik Tashpulatov</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            {selectedRows.size} of {mockDocuments.length} row(s) selected.
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span>Page 1 of 7</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  «
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  ‹
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  ›
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  »
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

