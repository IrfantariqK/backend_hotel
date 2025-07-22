import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { DealsService } from './deals.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  // Public: Get all deals
  @Get()
  async findAll() {
    return this.dealsService.findAll();
  }

  // Public: Get deal by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  // Kitchen only: Create deal
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Post()
  async create(@Body() dto: any, @Request() req) {
    return this.dealsService.create(dto);
  }

  // Kitchen only: Update deal
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.dealsService.update(id, dto);
  }

  // Kitchen only: Delete deal
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.dealsService.delete(id);
    return { message: 'Deal deleted' };
  }
} 