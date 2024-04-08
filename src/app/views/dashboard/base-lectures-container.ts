export class Paginator {
  data: any = [];
  pageIndex = 0;
  size = 20;

  constructor() {}

  setData(data: any) {
    this.data = data;
  }

  getNextPage() {
    return this.data.slice(
      this.size * this.pageIndex,
      this.size * ++this.pageIndex
    );
  }
}
