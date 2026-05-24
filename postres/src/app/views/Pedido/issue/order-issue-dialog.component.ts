import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Pedido, OrderIssue } from '../../../models/pedido.model';

@Component({
  selector: 'app-order-issue-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './order-issue-dialog.component.html',
  styleUrls: ['./order-issue-dialog.component.scss']
})
export class OrderIssueDialogComponent implements OnInit {
  issueForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrderIssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Pedido
  ) {}

  ngOnInit(): void {
    this.issueForm = this.fb.group({
      porcentajeError: [0],
      costOfIssue: [0],
      issueAffectsCosts: [false],
      issueAffectThePrice: [false],
      issueNote: ['', Validators.required]
    });
  }

  onSave(): void {
    if (this.issueForm.valid) {
        
      const updatedPedido: Pedido = {
        ...this.data,
        orderIssue: this.issueForm.value,
        issue: true
      };
      // debugger
      this.dialogRef.close(updatedPedido);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}