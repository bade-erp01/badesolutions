'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useParams } from "next/navigation";
import { Encrypt } from "../../../Functions/Mics";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function DebitnoteTable({ data }) {
  const [debitNotes, setDebitNotes] = useState(data.cn || []); // Note: using data.cn as per original
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const notesPerPage = 10;
  const Path = useParams();

  // Initialize filtered notes
  useEffect(() => {
    setFilteredNotes(debitNotes);
  }, [debitNotes]);

  // Search functionality
  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);
    
    const filtered = debitNotes.filter(note =>
      note.customer?.toLowerCase().includes(search) ||
      note.DebitId?.toLowerCase().includes(search) ||
      note.Date?.toLowerCase().includes(search) ||
      note.raisedBy?.toLowerCase().includes(search)
    );
    
    setFilteredNotes(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;

  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  return (
    <div className="bg-background space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Debit Notes</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your debit notes issued to customers
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Debit Notes List</CardTitle>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by customer, debit ID, or date..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Accountant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="w-12 h-12 mb-4 opacity-40" />
                        <p className="text-lg font-medium">No debit notes found</p>
                        <p className="text-sm mt-1">Try adjusting your search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedNotes.map((note, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link 
                          href={`/${Path.auth}/V4/${Path.Module}/${Path.Module}/debit-note/debit-note/${Encrypt(note._id)}`}
                          className="hover:text-primary hover:underline"
                        >
                          {note.DebitId}
                        </Link>
                      </TableCell>
                      <TableCell>{note.customer}</TableCell>
                      <TableCell>{note.raisedBy}</TableCell>
                      <TableCell className="font-medium">
                        ₦{Number(note.Total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(note.Date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            note.status === 'Closed' ? 'default' :
                            note.status === 'Open' ? 'secondary' : 'destructive'
                          }
                        >
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredNotes.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredNotes.length)} of {filteredNotes.length} entries
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                
                <div className="text-sm font-medium px-4 py-1">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}